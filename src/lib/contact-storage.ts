import { randomUUID } from "node:crypto";
import { link, mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { isSubmissionId, type ContactSubmission } from "./contact-validation";

export type EmailDelivery = "not-configured" | "pending" | "sent" | "failed";
export type ContactRecord = ContactSubmission & {
  receivedAt: string;
  emailDelivery: EmailDelivery;
};

export class SubmissionConflictError extends Error {}

export function contactDataDirectory() {
  const configured = process.env.CONTACT_DATA_DIR;
  // Runtime storage is supplied by the host; private submissions must not enter the build bundle.
  return configured
    ? path.resolve(/* turbopackIgnore: true */ configured)
    : path.join(process.cwd(), "data", "contact");
}

function recordPath(directory: string, id: string) {
  if (!isSubmissionId(id)) throw new Error("Invalid submission identifier");
  return path.join(directory, `${id.toLowerCase()}.json`);
}

async function writePrivateFile(filename: string, record: ContactRecord) {
  const file = await open(filename, "wx", 0o600);
  try {
    await file.writeFile(`${JSON.stringify(record, null, 2)}\n`, "utf8");
    await file.sync();
  } finally {
    await file.close();
  }
}

// Publishing with link is atomic and exclusive: concurrent retries see a complete record.
export async function persistContact(
  submission: ContactSubmission,
  emailDelivery: EmailDelivery,
  directory = contactDataDirectory(),
): Promise<{ created: boolean; record: ContactRecord }> {
  const destination = recordPath(directory, submission.submissionId);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporary = path.join(directory, `.${randomUUID()}.tmp`);
  const record: ContactRecord = {
    ...submission,
    receivedAt: new Date().toISOString(),
    emailDelivery,
  };

  try {
    await writePrivateFile(temporary, record);
    try {
      await link(temporary, destination);
      return { created: true, record };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const existing = JSON.parse(
        await readFile(destination, "utf8"),
      ) as ContactRecord;
      if (
        existing.name !== submission.name ||
        existing.email !== submission.email ||
        existing.message !== submission.message
      ) {
        throw new SubmissionConflictError("Submission identifier already used");
      }
      return { created: false, record: existing };
    }
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

export async function updateEmailDelivery(
  record: ContactRecord,
  emailDelivery: EmailDelivery,
  directory = contactDataDirectory(),
) {
  const destination = recordPath(directory, record.submissionId);
  const temporary = path.join(directory, `.${randomUUID()}.tmp`);
  try {
    await writePrivateFile(temporary, { ...record, emailDelivery });
    await rename(temporary, destination);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}
