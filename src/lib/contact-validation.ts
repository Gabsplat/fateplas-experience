export const CONTACT_LIMITS = { name: 120, email: 254, message: 5000 } as const;

export type ContactFields = { name: string; email: string; message: string };
export type ContactSubmission = ContactFields & { submissionId: string };
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;

export function isSubmissionId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function validateContactFields(
  input: unknown,
): { ok: true; fields: ContactFields } | { ok: false; errors: ContactErrors } {
  const source =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const errors: ContactErrors = {};
  const fields: ContactFields = { name: "", email: "", message: "" };

  for (const field of ["name", "email", "message"] as const) {
    const value = typeof source[field] === "string" ? source[field].trim() : "";
    fields[field] = value;
    if (!value) errors[field] = "Este campo es requerido.";
    else if (value.length > CONTACT_LIMITS[field]) {
      errors[field] = `Usá hasta ${CONTACT_LIMITS[field]} caracteres.`;
    } else if (
      value.includes("\0") ||
      (field !== "message" && /[\r\n]/.test(value))
    ) {
      errors[field] = "Revisá el contenido de este campo.";
    }
  }

  if (fields.email && !errors.email && !EMAIL.test(fields.email)) {
    errors.email = "Por favor, ingresa un email válido.";
  }

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, fields };
}
