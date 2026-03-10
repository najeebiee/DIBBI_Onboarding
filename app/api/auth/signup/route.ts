import { NextResponse } from "next/server";
import {
  normalizeUsernameForAuth,
  usernameToInternalEmail,
} from "@/lib/auth/usernameToInternalEmail";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

type SignupBody = {
  username?: string;
  password?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const rawUsername = body.username?.trim() ?? "";
    const username = normalizeUsernameForAuth(rawUsername);
    const password = body.password ?? "";
    const fullName = body.fullName?.trim() ?? "";

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required." },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 },
      );
    }

    const internalEmail = usernameToInternalEmail(username);
    const supabase = createServiceRoleClient();

    const existingProfile = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingProfile.error) {
      return NextResponse.json(
        { success: false, error: "Failed to validate username.", details: existingProfile.error.message },
        { status: 500 },
      );
    }

    if (existingProfile.data) {
      return NextResponse.json(
        { success: false, error: "Username is already taken." },
        { status: 409 },
      );
    }

    const createUserResult = await supabase.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    });

    if (createUserResult.error || !createUserResult.data.user) {
      const message = createUserResult.error?.message ?? "Unable to create account.";
      const statusCode = message.toLowerCase().includes("already") ? 409 : 500;

      return NextResponse.json(
        { success: false, error: message },
        { status: statusCode },
      );
    }

    const profileUpsert = await supabase.from("profiles").upsert(
      {
        id: createUserResult.data.user.id,
        username,
        full_name: fullName || null,
        internal_email: internalEmail,
        needs_password_reset: false,
      },
      { onConflict: "id" },
    );

    if (profileUpsert.error) {
      return NextResponse.json(
        { success: false, error: "Account created but profile setup failed.", details: profileUpsert.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error creating account.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}