import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createServerSupabaseClient(accessToken?: string): SupabaseClient {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

function parseAccessTokenFromSbCookie(rawValue: string): string | null {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return parsed[0];
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "access_token" in parsed &&
      typeof (parsed as { access_token?: unknown }).access_token === "string"
    ) {
      return (parsed as { access_token: string }).access_token;
    }
  } catch {
    return null;
  }

  return null;
}

export function getServerAccessToken(cookies: ReadonlyRequestCookies): string | null {
  const directToken = cookies.get("dibbi-access-token")?.value;
  if (directToken) return directToken;

  const sbAccessToken = cookies.get("sb-access-token")?.value;
  if (sbAccessToken) return sbAccessToken;

  const allCookies = cookies.getAll();
  for (const cookie of allCookies) {
    if (!cookie.name.startsWith("sb-") || !cookie.name.endsWith("-auth-token")) {
      continue;
    }
    const token = parseAccessTokenFromSbCookie(cookie.value);
    if (token) return token;
  }

  return null;
}
