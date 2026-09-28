import { sendContactMail, contactEmailConfigured } from "@/lib/contact-mail";
import {
  persistContact,
  SubmissionConflictError,
  updateEmailDelivery,
} from "@/lib/contact-storage";
import {
  isSubmissionId,
  validateContactFields,
} from "@/lib/contact-validation";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 32_768;

function reply(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function readLimitedBody(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
    throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError();
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return reply(
      { message: "No se pudo enviar el mensaje desde este origen." },
      403,
    );
  }
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    return reply({ message: "El formato del mensaje no es válido." }, 415);
  }

  let body: unknown;
  try {
    body = await readLimitedBody(request);
  } catch (error) {
    return reply(
      {
        message:
          error instanceof RangeError
            ? "El mensaje es demasiado largo."
            : "El mensaje no es válido.",
      },
      error instanceof RangeError ? 413 : 400,
    );
  }

  const result = validateContactFields(body);
  if (!result.ok)
    return reply(
      { message: "Revisá los campos indicados.", errors: result.errors },
      400,
    );
  const payload = body as Record<string, unknown>;
  if (!isSubmissionId(payload.submissionId))
    return reply({ message: "La referencia del mensaje no es válida." }, 400);
  if (typeof payload.website === "string" && payload.website.trim())
    return reply({ message: "¡Gracias! Recibimos tu mensaje." }, 200);

  try {
    const configured = contactEmailConfigured();
    const { created, record } = await persistContact(
      { ...result.fields, submissionId: payload.submissionId },
      configured ? "pending" : "not-configured",
    );
    // A saved submission is successful even if email fails. Retrying its ID never resends email.
    if (created && configured) {
      let delivery: "sent" | "failed" = "sent";
      try {
        await sendContactMail(record);
      } catch {
        delivery = "failed";
        console.error(
          "Contact email delivery failed; submission remains saved.",
        );
      }
      try {
        await updateEmailDelivery(record, delivery);
      } catch {
        console.error(
          "Contact email status could not be updated; submission remains saved.",
        );
      }
    }
    return reply(
      {
        message: "¡Gracias! Recibimos tu mensaje.",
        submissionId: record.submissionId,
      },
      created ? 201 : 200,
    );
  } catch (error) {
    if (error instanceof SubmissionConflictError)
      return reply(
        {
          message:
            "La referencia ya pertenece a otra consulta. Recargá la página e intentá nuevamente.",
        },
        409,
      );
    console.error("Contact submission could not be saved.");
    return reply(
      {
        message:
          "No pudimos guardar tu mensaje. Intentá nuevamente en unos minutos.",
      },
      503,
    );
  }
}
