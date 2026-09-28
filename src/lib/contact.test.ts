import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { POST } from "../app/api/contact/route";
import { contactEmailConfigured, sendContactMail } from "./contact-mail";
import {
  persistContact,
  SubmissionConflictError,
  updateEmailDelivery,
} from "./contact-storage";
import {
  CONTACT_LIMITS,
  isSubmissionId,
  validateContactFields,
} from "./contact-validation";

const fields = {
  name: "Nombre de prueba",
  email: "prueba@example.com",
  message: "Consulta de prueba\nSegunda línea",
};

test("validation trims fields and preserves multiline messages", () => {
  assert.deepEqual(
    validateContactFields({ ...fields, name: ` ${fields.name} ` }),
    { ok: true, fields },
  );
});

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost:4320/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function isolatedContactDirectory(
  action: (directory: string) => Promise<void>,
) {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "fateplas-contact-api-"),
  );
  const keys = [
    "CONTACT_DATA_DIR",
    "CONTACT_EMAIL_PROVIDER",
    "RESEND_API_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "CONTACT_EMAIL_FROM",
    "CONTACT_EMAIL_TO",
  ] as const;
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  process.env.CONTACT_DATA_DIR = directory;
  delete process.env.CONTACT_EMAIL_PROVIDER;
  delete process.env.RESEND_API_KEY;
  delete process.env.SMTP_HOST;
  delete process.env.CONTACT_EMAIL_FROM;
  delete process.env.CONTACT_EMAIL_TO;
  try {
    await action(directory);
  } finally {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
}

test("API rejects unsupported formats, invalid JSON, excessive streamed bodies and cross-site fetches", async () => {
  assert.equal(
    (await POST(request("{}", { "Content-Type": "text/plain" }))).status,
    415,
  );
  assert.equal((await POST(request("{"))).status, 400);
  assert.equal((await POST(request({}))).status, 400);
  assert.equal(
    (await POST(request("{}", { "sec-fetch-site": "cross-site" }))).status,
    403,
  );
  const oversized = request(`{"message":"${"x".repeat(32_768)}"}`);
  assert.equal(oversized.headers.has("content-length"), false);
  assert.equal((await POST(oversized)).status, 413);
});

test("API ignores honeypot submissions without creating files", async () => {
  await isolatedContactDirectory(async (directory) => {
    const response = await POST(
      request({
        ...fields,
        submissionId: randomUUID(),
        website: "https://spam.example",
      }),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await readdir(directory), []);
  });
});

test("API accepts and deduplicates messages, rejects conflicting retries, and sets no-store", async () => {
  await isolatedContactDirectory(async (directory) => {
    const payload = { ...fields, submissionId: randomUUID() };
    const created = await POST(request(payload));
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("cache-control"), "no-store");
    assert.equal((await created.json()).submissionId, payload.submissionId);
    assert.equal((await POST(request(payload))).status, 200);
    assert.equal(
      (await POST(request({ ...payload, message: "Otra consulta" }))).status,
      409,
    );
    assert.equal((await readdir(directory)).length, 1);
  });
});

test("API reports storage failure and preserves a saved submission after SMTP failure", async () => {
  await isolatedContactDirectory(async (directory) => {
    const payload = { ...fields, submissionId: randomUUID() };
    const invalidDirectory = path.join(directory, "not-a-directory");
    await writeFile(invalidDirectory, "fixture");
    process.env.CONTACT_DATA_DIR = invalidDirectory;
    assert.equal((await POST(request(payload))).status, 503);

    process.env.CONTACT_DATA_DIR = directory;
    process.env.CONTACT_EMAIL_PROVIDER = "smtp";
    process.env.SMTP_HOST = "localhost";
    process.env.SMTP_PORT = "0"; // Invalid config fails before any network connection.
    process.env.CONTACT_EMAIL_FROM = "sender@example.com";
    process.env.CONTACT_EMAIL_TO = "recipient@example.com";
    assert.equal((await POST(request(payload))).status, 201);
    const filename = path.join(directory, `${payload.submissionId}.json`);
    assert.equal(
      JSON.parse(await readFile(filename, "utf8")).emailDelivery,
      "failed",
    );
    assert.equal((await POST(request(payload))).status, 200);
    assert.equal(
      JSON.parse(await readFile(filename, "utf8")).emailDelivery,
      "failed",
    );
  });
});

test("email delivery stays disabled by default and with none even when credentials exist", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network request");
  });
  await isolatedContactDirectory(async (directory) => {
    process.env.RESEND_API_KEY = "mock-key";
    process.env.SMTP_HOST = "mock-host";
    process.env.CONTACT_EMAIL_FROM = "sender@example.com";
    process.env.CONTACT_EMAIL_TO = "recipient@example.com";
    for (const provider of [undefined, "none", "unknown"]) {
      if (provider === undefined) delete process.env.CONTACT_EMAIL_PROVIDER;
      else process.env.CONTACT_EMAIL_PROVIDER = provider;
      assert.equal(contactEmailConfigured(), false);
      const payload = { ...fields, submissionId: randomUUID() };
      assert.equal((await POST(request(payload))).status, 201);
      const saved = JSON.parse(
        await readFile(
          path.join(directory, `${payload.submissionId}.json`),
          "utf8",
        ),
      );
      assert.equal(saved.emailDelivery, "not-configured");
      await assert.rejects(sendContactMail(saved), /disabled or incomplete/);
    }
    assert.equal(fetch.mock.calls.length, 0);
  });
});

test("Resend sends only after persistence and uses an idempotency key, reply address and timeout", async (t) => {
  await isolatedContactDirectory(async (directory) => {
    process.env.CONTACT_EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "mock-key";
    process.env.CONTACT_EMAIL_FROM = "Fateplas <sender@example.com>";
    process.env.CONTACT_EMAIL_TO = "recipient@example.com";
    const payload = { ...fields, submissionId: randomUUID() };
    const filename = path.join(directory, `${payload.submissionId}.json`);
    const fetch = t.mock.method(
      globalThis,
      "fetch",
      async (url: string | URL | Request, options?: RequestInit) => {
        assert.equal(url, "https://api.resend.com/emails");
        assert.equal(
          JSON.parse(await readFile(filename, "utf8")).emailDelivery,
          "pending",
        );
        const headers = new Headers(options?.headers);
        assert.equal(headers.get("Authorization"), "Bearer mock-key");
        assert.equal(
          headers.get("Idempotency-Key"),
          `contact/${payload.submissionId}`,
        );
        assert.equal(options?.method, "POST");
        assert.ok(options?.signal instanceof AbortSignal);
        const body = JSON.parse(options?.body as string);
        assert.equal(body.from, "Fateplas <sender@example.com>");
        assert.deepEqual(body.to, ["recipient@example.com"]);
        assert.equal(body.reply_to, fields.email);
        assert.equal(body.subject, "Nueva consulta desde Fateplas");
        assert.ok(body.text.includes(fields.message));
        return Response.json({ id: "mock-message-id" });
      },
    );
    assert.equal((await POST(request(payload))).status, 201);
    assert.equal(
      JSON.parse(await readFile(filename, "utf8")).emailDelivery,
      "sent",
    );
    assert.equal((await POST(request(payload))).status, 200);
    assert.equal(fetch.mock.calls.length, 1);
  });
});

test("Resend errors, malformed responses and timeouts preserve saved messages without retries", async (t) => {
  await isolatedContactDirectory(async (directory) => {
    process.env.CONTACT_EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "mock-key";
    process.env.CONTACT_EMAIL_FROM = "sender@example.com";
    process.env.CONTACT_EMAIL_TO = "recipient@example.com";
    for (const response of ["http-error", "invalid-json", "timeout"]) {
      const fetch = t.mock.method(globalThis, "fetch", async () => {
        if (response === "timeout")
          throw new DOMException("Mock timeout", "TimeoutError");
        return response === "http-error"
          ? Response.json({ error: "mock-error" }, { status: 422 })
          : Response.json({});
      });
      const payload = { ...fields, submissionId: randomUUID() };
      assert.equal((await POST(request(payload))).status, 201);
      const saved = JSON.parse(
        await readFile(
          path.join(directory, `${payload.submissionId}.json`),
          "utf8",
        ),
      );
      assert.equal(saved.emailDelivery, "failed");
      assert.equal(saved.message, fields.message);
      assert.equal((await POST(request(payload))).status, 200);
      assert.equal(fetch.mock.calls.length, 1);
      fetch.mock.restore();
    }
  });
});

test("validation rejects missing fields, invalid email, header injection, oversized input and unsafe IDs", () => {
  for (const value of [
    null,
    [],
    {},
    { ...fields, email: "email inválido" },
    { ...fields, name: "Nombre\r\nBcc: attacker@example.com" },
    { ...fields, message: "x".repeat(CONTACT_LIMITS.message + 1) },
    { ...fields, name: "\0" },
  ]) {
    assert.equal(validateContactFields(value).ok, false);
  }
  assert.equal(isSubmissionId("../../secrets"), false);
  assert.equal(isSubmissionId(randomUUID()), true);
});

test("concurrent retries persist one private record and update email status atomically", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "fateplas-contact-"));
  try {
    const submission = { ...fields, submissionId: randomUUID() };
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        persistContact(submission, "pending", directory),
      ),
    );
    assert.equal(results.filter((result) => result.created).length, 1);
    assert.equal((await readdir(directory)).length, 1);
    const filename = path.join(directory, `${submission.submissionId}.json`);
    assert.equal((await stat(filename)).mode & 0o777, 0o600);
    await updateEmailDelivery(results[0].record, "failed", directory);
    const saved = JSON.parse(await readFile(filename, "utf8"));
    assert.equal(saved.message, fields.message);
    assert.equal(saved.emailDelivery, "failed");
    const retry = await persistContact(submission, "pending", directory);
    assert.equal(retry.created, false);
    assert.equal(retry.record.emailDelivery, "failed");
    await assert.rejects(
      persistContact(
        { ...submission, message: "Otra consulta" },
        "pending",
        directory,
      ),
      SubmissionConflictError,
    );
    await assert.rejects(
      persistContact(
        { ...submission, submissionId: "../outside" },
        "pending",
        directory,
      ),
    );
    assert.equal((await readdir(directory)).length, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
