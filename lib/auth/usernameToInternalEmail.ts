export function normalizeUsernameForAuth(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, "");
}

export function usernameToInternalEmail(username: string): string {
  const normalized = normalizeUsernameForAuth(username);
  return `${normalized}@dibbi.local`;
}

