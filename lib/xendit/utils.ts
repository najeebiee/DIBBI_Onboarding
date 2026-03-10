const ACCESS_CODE_PREFIX = "DIBBI";
const ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeAccessCode(input: string): string {
  return input.trim().toUpperCase();
}

function randomAlphanumeric(length: number): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += ALPHANUMERIC[values[i] % ALPHANUMERIC.length];
  }
  return output;
}

export function generateCourseAccessCode(randomLength = 6): string {
  return `${ACCESS_CODE_PREFIX}-${randomAlphanumeric(randomLength)}`;
}

export function generateOrderExternalId(courseSlug: string): string {
  const cleanedSlug = courseSlug
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "COURSE";

  const suffix = randomAlphanumeric(6);
  return `ORDER-${cleanedSlug}-${suffix}`;
}

export function buildXenditRedirectUrl(
  appUrl: string,
  route: "/payment/success" | "/payment/failed",
  externalId: string,
): string {
  const normalizedAppUrl = appUrl.replace(/\/+$/, "");
  const encodedExternalId = encodeURIComponent(externalId);

  return `${normalizedAppUrl}${route}?external_id=${encodedExternalId}`;
}

export function normalizeOrderStatus(status: string | null | undefined):
  | "pending"
  | "paid"
  | "failed"
  | "expired" {
  const normalized = status?.trim().toUpperCase();

  if (normalized === "PAID" || normalized === "SETTLED") return "paid";
  if (normalized === "EXPIRED") return "expired";
  if (normalized === "FAILED") return "failed";
  return "pending";
}
