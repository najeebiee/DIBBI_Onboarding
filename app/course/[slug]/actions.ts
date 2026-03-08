"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  getServerAccessToken,
} from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function markLessonCompleteAction(formData: FormData) {
  const courseSlug = getFormValue(formData, "courseSlug");
  const lessonId = getFormValue(formData, "lessonId");

  if (!courseSlug || !lessonId) {
    return;
  }

  const cookieStore = await cookies();
  const accessToken = getServerAccessToken(cookieStore);
  if (!accessToken) {
    redirect("/login");
  }

  const supabase = createServerSupabaseClient(accessToken);
  const userResult = await supabase.auth.getUser(accessToken);
  if (userResult.error || !userResult.data.user) {
    redirect("/login");
  }

  const userId = userResult.data.user.id;

  const courseResult = await supabase
    .from("courses")
    .select("id, slug")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (courseResult.error || !courseResult.data) {
    redirect("/courses?tab=explore");
  }

  const course = courseResult.data as { id: string; slug: string };

  const accessResult = await supabase
    .from("user_course_access")
    .select("access_status")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .eq("access_status", "unlocked")
    .maybeSingle();

  if (accessResult.error || !accessResult.data) {
    redirect("/courses?tab=explore");
  }

  const lessonResult = await supabase
    .from("course_lessons")
    .select("id, lesson_number")
    .eq("id", lessonId)
    .eq("course_id", course.id)
    .eq("is_published", true)
    .maybeSingle();

  if (lessonResult.error || !lessonResult.data) {
    redirect(`/course/${course.slug}`);
  }

  const lesson = lessonResult.data as { id: string; lesson_number: number };
  const nowIso = new Date().toISOString();

  const upsertResult = await supabase.from("user_lesson_progress").upsert(
    {
      user_id: userId,
      course_id: course.id,
      lesson_id: lesson.id,
      is_completed: true,
      completed_at: nowIso,
      last_opened_at: nowIso,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (upsertResult.error) {
    redirect(`/course/${course.slug}?lesson=${lesson.lesson_number}`);
  }

  revalidatePath(`/course/${course.slug}`);
  redirect(`/course/${course.slug}?lesson=${lesson.lesson_number}`);
}
