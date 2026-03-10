"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  createServerSupabaseClient,
  getServerAccessToken,
} from "@/lib/supabase/server";
import { normalizeAccessCode } from "@/lib/xendit/utils";

export type RedeemCodeActionState = {
  error: string | null;
};

export const initialRedeemCodeState: RedeemCodeActionState = {
  error: null,
};

async function upsertUserCourseAccess(params: {
  userId: string;
  courseId: string;
}) {
  const { userId, courseId } = params;
  const supabase = createServiceRoleClient();
  const nowIso = new Date().toISOString();

  const fullUpsert = await supabase.from("user_course_access").upsert(
    {
      user_id: userId,
      course_id: courseId,
      access_status: "unlocked",
      unlocked_at: nowIso,
      source: "code",
    },
    { onConflict: "user_id,course_id" },
  );

  if (!fullUpsert.error) return;

  const fallbackUpsert = await supabase.from("user_course_access").upsert(
    {
      user_id: userId,
      course_id: courseId,
      access_status: "unlocked",
    },
    { onConflict: "user_id,course_id" },
  );

  if (fallbackUpsert.error) {
    throw new Error(fallbackUpsert.error.message);
  }
}

export async function redeemCodeAction(
  _prevState: RedeemCodeActionState,
  formData: FormData,
): Promise<RedeemCodeActionState> {
  const cookieStore = await cookies();
  const accessToken = getServerAccessToken(cookieStore);
  if (!accessToken) {
    redirect("/login");
  }

  const authClient = createServerSupabaseClient(accessToken);
  const userResult = await authClient.auth.getUser(accessToken);

  if (userResult.error || !userResult.data.user) {
    redirect("/login");
  }

  const userId = userResult.data.user.id;
  const rawCode = formData.get("code");
  const code = normalizeAccessCode(typeof rawCode === "string" ? rawCode : "");

  if (!code) {
    return { error: "Please enter your access code." };
  }

  const supabase = createServiceRoleClient();
  const nowIso = new Date().toISOString();

  const claimResult = await supabase
    .from("course_access_codes")
    .update({
      is_used: true,
      used_at: nowIso,
      redeemed_by_user_id: userId,
    })
    .eq("code", code)
    .eq("is_used", false)
    .select("course_id")
    .maybeSingle();

  if (claimResult.error) {
    return { error: "Unable to redeem code right now. Please try again." };
  }

  let courseId = claimResult.data?.course_id ?? null;

  if (!courseId) {
    const existingCode = await supabase
      .from("course_access_codes")
      .select("is_used, redeemed_by_user_id, course_id")
      .eq("code", code)
      .maybeSingle();

    if (existingCode.error) {
      return { error: "Unable to validate access code." };
    }

    if (!existingCode.data) {
      return { error: "Invalid access code." };
    }

    if (existingCode.data.is_used) {
      return {
        error:
          existingCode.data.redeemed_by_user_id === userId
            ? "This code has already been redeemed by your account."
            : "This code has already been used.",
      };
    }

    courseId = existingCode.data.course_id;
  }

  try {
    await upsertUserCourseAccess({ userId, courseId });
  } catch {
    return { error: "Code accepted but failed to unlock the course. Please contact support." };
  }

  const courseResult = await supabase
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .maybeSingle();

  if (courseResult.error || !courseResult.data?.slug) {
    redirect("/courses?tab=enrollments");
  }

  redirect(`/course/${courseResult.data.slug}`);
}