import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseLessonItem, CoursePageData } from "@/types/course-page";

type CourseRow = {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
};

type LessonRow = {
  id: string;
  course_id: string;
  lesson_number: number;
  title: string | null;
  description: string | null;
  content_url: string | null;
};

type AccessRow = {
  access_status: string | null;
};

type LessonProgressRow = {
  lesson_id: string;
  is_completed: boolean | null;
};

export class CourseNotFoundError extends Error {}
export class CourseAccessDeniedError extends Error {}

export type GetCoursePageDataOptions = {
  supabase: SupabaseClient;
  userId: string;
  slug: string;
  lessonNumber?: number | null;
};

function clampPercent(percent: number): number {
  if (Number.isNaN(percent)) return 0;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function normalizeLessonNumber(lessonNumber?: number | null): number | null {
  if (typeof lessonNumber !== "number" || !Number.isFinite(lessonNumber)) return null;
  const parsed = Math.trunc(lessonNumber);
  return parsed > 0 ? parsed : null;
}

function normalizeTitle(value: string | null, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export async function getCourseBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<CourseRow | null> {
  const result = await supabase
    .from("courses")
    .select("id, slug, title, description, thumbnail_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (result.error) throw new Error(result.error.message);
  return (result.data as CourseRow | null) ?? null;
}

export async function getUserCourseAccess(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<AccessRow | null> {
  const result = await supabase
    .from("user_course_access")
    .select("access_status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("access_status", "unlocked")
    .maybeSingle();

  if (result.error) throw new Error(result.error.message);
  return (result.data as AccessRow | null) ?? null;
}

export async function getCourseLessons(
  supabase: SupabaseClient,
  courseId: string,
): Promise<LessonRow[]> {
  const result = await supabase
    .from("course_lessons")
    .select("id, course_id, lesson_number, title, description, content_url")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("lesson_number", { ascending: true });

  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as LessonRow[];
}

export async function getUserLessonProgress(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<LessonProgressRow[]> {
  const result = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as LessonProgressRow[];
}

function mapLessonItems(
  slug: string,
  lessons: LessonRow[],
  completedLessonIds: Set<string>,
  selectedLessonId: string | null,
): CourseLessonItem[] {
  return lessons.map((lesson) => ({
    id: lesson.id,
    lessonNumber: lesson.lesson_number,
    title: normalizeTitle(lesson.title, `Lesson ${lesson.lesson_number}`),
    description: lesson.description,
    contentUrl: lesson.content_url,
    isCompleted: completedLessonIds.has(lesson.id),
    isActive: lesson.id === selectedLessonId,
    href: `/course/${slug}?lesson=${lesson.lesson_number}`,
  }));
}

function resolveSelectedLessonIndex(
  lessons: LessonRow[],
  lessonNumber: number | null,
): number {
  if (lessons.length === 0) return -1;
  if (lessonNumber === null) return 0;
  const foundIndex = lessons.findIndex(
    (lesson) => lesson.lesson_number === lessonNumber,
  );
  return foundIndex >= 0 ? foundIndex : 0;
}

export async function getCoursePageData({
  supabase,
  userId,
  slug,
  lessonNumber,
}: GetCoursePageDataOptions): Promise<CoursePageData> {
  const course = await getCourseBySlug(supabase, slug);
  if (!course) {
    throw new CourseNotFoundError("Course not found.");
  }

  const access = await getUserCourseAccess(supabase, userId, course.id);
  if (!access || access.access_status !== "unlocked") {
    throw new CourseAccessDeniedError("Course access is locked.");
  }

  const [lessons, progressRows] = await Promise.all([
    getCourseLessons(supabase, course.id),
    getUserLessonProgress(supabase, userId, course.id),
  ]);

  const completedLessonIds = new Set(
    progressRows.filter((row) => row.is_completed).map((row) => row.lesson_id),
  );

  const normalizedLessonNumber = normalizeLessonNumber(lessonNumber);
  const selectedIndex = resolveSelectedLessonIndex(lessons, normalizedLessonNumber);
  const selectedLessonRow = selectedIndex >= 0 ? lessons[selectedIndex] : null;
  const selectedLessonId = selectedLessonRow?.id ?? null;

  const previousLessonHref =
    selectedIndex > 0
      ? `/course/${course.slug}?lesson=${lessons[selectedIndex - 1].lesson_number}`
      : null;
  const nextLessonHref =
    selectedIndex >= 0 && selectedIndex < lessons.length - 1
      ? `/course/${course.slug}?lesson=${lessons[selectedIndex + 1].lesson_number}`
      : null;

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) =>
    completedLessonIds.has(lesson.id),
  ).length;
  const progressPercent =
    totalLessons > 0 ? clampPercent((completedLessons / totalLessons) * 100) : 0;

  const lessonItems = mapLessonItems(
    course.slug,
    lessons,
    completedLessonIds,
    selectedLessonId,
  );

  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: normalizeTitle(course.title, "Untitled Course"),
    courseDescription: course.description,
    thumbnailUrl: course.thumbnail_url,
    sidebar: {
      coachName: "DIBBI Coach",
      coachAvatarUrl: null,
      progressPercent,
      completedLessons,
      totalLessons,
      lessons: lessonItems,
      previousLessonHref,
      nextLessonHref,
    },
    selectedLesson: selectedLessonRow
      ? {
          id: selectedLessonRow.id,
          lessonNumber: selectedLessonRow.lesson_number,
          title: normalizeTitle(
            selectedLessonRow.title,
            `Lesson ${selectedLessonRow.lesson_number}`,
          ),
          description: selectedLessonRow.description,
          contentUrl: selectedLessonRow.content_url,
          isCompleted: completedLessonIds.has(selectedLessonRow.id),
        }
      : null,
  };
}
