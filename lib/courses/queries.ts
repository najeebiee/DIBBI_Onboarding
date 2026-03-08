import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseListItem, CoursesTab } from "@/types/course";

type GetCourseQueryOptions = {
  supabase: SupabaseClient;
  userId: string;
  search?: string;
};

export type GetCoursesPageDataOptions = {
  supabase: SupabaseClient;
  userId: string;
  tab: CoursesTab;
  search?: string;
};

type CourseRow = {
  id: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  author?: string | null;
  instructor?: string | null;
  instructor_name?: string | null;
};

type AccessRow = {
  course_id: string;
};

type LessonRow = {
  course_id: string;
};

type ProgressRow = {
  course_id: string;
  completed_lessons?: number | null;
  total_lessons?: number | null;
  progress_percent?: number | null;
};

type UserState = {
  unlockedCourseIds: Set<string>;
  progressByCourseId: Map<string, ProgressRow>;
};

type BuildCourseItemsOptions = {
  courses: CourseRow[];
  userState: UserState;
  lessonCountByCourseId: Map<string, number>;
};

function normalizeSearch(search?: string): string {
  return search?.trim() ?? "";
}

function clampPercent(percent: number): number {
  if (Number.isNaN(percent)) return 0;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function toSearchFilter(search: string): string {
  return `title.ilike.%${search}%,description.ilike.%${search}%`;
}

async function getUserState(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserState> {
  const [accessResult, progressResult] = await Promise.all([
    supabase.from("user_course_access").select("course_id").eq("user_id", userId),
    supabase
      .from("user_course_progress")
      .select("course_id, completed_lessons, total_lessons, progress_percent")
      .eq("user_id", userId),
  ]);

  if (accessResult.error) throw new Error(accessResult.error.message);
  if (progressResult.error) throw new Error(progressResult.error.message);

  const unlockedCourseIds = new Set(
    ((accessResult.data ?? []) as AccessRow[]).map((row) => row.course_id),
  );
  const progressByCourseId = new Map<string, ProgressRow>(
    ((progressResult.data ?? []) as ProgressRow[]).map((row) => [row.course_id, row]),
  );

  return { unlockedCourseIds, progressByCourseId };
}

async function getLessonCountsByCourseId(
  supabase: SupabaseClient,
  courseIds: string[],
): Promise<Map<string, number>> {
  if (courseIds.length === 0) return new Map<string, number>();

  const lessonsResult = await supabase
    .from("course_lessons")
    .select("course_id")
    .in("course_id", courseIds);

  if (lessonsResult.error) throw new Error(lessonsResult.error.message);

  const counts = new Map<string, number>();
  for (const lesson of (lessonsResult.data ?? []) as LessonRow[]) {
    counts.set(lesson.course_id, (counts.get(lesson.course_id) ?? 0) + 1);
  }
  return counts;
}

function buildCourseItems({
  courses,
  userState,
  lessonCountByCourseId,
}: BuildCourseItemsOptions): CourseListItem[] {
  return courses.map((course) => {
    const progress = userState.progressByCourseId.get(course.id);
    const totalLessonsFromLessons = lessonCountByCourseId.get(course.id) ?? 0;
    const totalLessons = Math.max(
      0,
      progress?.total_lessons ?? totalLessonsFromLessons,
    );
    const completedLessons = Math.max(0, progress?.completed_lessons ?? 0);
    const fallbackPercent =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      id: course.id,
      slug: course.slug ?? course.id,
      title: course.title ?? "Untitled Course",
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      author:
        course.author ?? course.instructor ?? course.instructor_name ?? "DIBBI",
      isUnlocked: userState.unlockedCourseIds.has(course.id),
      completedLessons,
      totalLessons,
      progressPercent: clampPercent(progress?.progress_percent ?? fallbackPercent),
    };
  });
}

export async function getEnrollmentCourses({
  supabase,
  userId,
  search,
}: GetCourseQueryOptions): Promise<CourseListItem[]> {
  const normalizedSearch = normalizeSearch(search);
  const userState = await getUserState(supabase, userId);
  const unlockedIds = Array.from(userState.unlockedCourseIds);

  if (unlockedIds.length === 0) return [];

  let query = supabase.from("courses").select("*").in("id", unlockedIds);
  if (normalizedSearch) {
    query = query.or(toSearchFilter(normalizedSearch));
  }

  const coursesResult = await query;
  if (coursesResult.error) throw new Error(coursesResult.error.message);

  const courses = (coursesResult.data ?? []) as CourseRow[];
  const lessonCountByCourseId = await getLessonCountsByCourseId(
    supabase,
    courses.map((course) => course.id),
  );

  return buildCourseItems({ courses, userState, lessonCountByCourseId });
}

export async function getExploreCourses({
  supabase,
  userId,
  search,
}: GetCourseQueryOptions): Promise<CourseListItem[]> {
  const normalizedSearch = normalizeSearch(search);
  const userState = await getUserState(supabase, userId);

  let query = supabase.from("courses").select("*").eq("is_published", true);
  if (normalizedSearch) {
    query = query.or(toSearchFilter(normalizedSearch));
  }

  const publishedResult = await query;
  let courses: CourseRow[] = [];

  if (publishedResult.error) {
    let fallbackQuery = supabase.from("courses").select("*");
    if (normalizedSearch) {
      fallbackQuery = fallbackQuery.or(toSearchFilter(normalizedSearch));
    }
    const fallbackResult = await fallbackQuery;
    if (fallbackResult.error) throw new Error(fallbackResult.error.message);
    courses = (fallbackResult.data ?? []) as CourseRow[];
  } else {
    courses = (publishedResult.data ?? []) as CourseRow[];
  }

  const lessonCountByCourseId = await getLessonCountsByCourseId(
    supabase,
    courses.map((course) => course.id),
  );

  return buildCourseItems({ courses, userState, lessonCountByCourseId });
}

export async function getCoursesPageData({
  supabase,
  userId,
  tab,
  search,
}: GetCoursesPageDataOptions): Promise<CourseListItem[]> {
  if (tab === "explore") {
    return getExploreCourses({ supabase, userId, search });
  }
  return getEnrollmentCourses({ supabase, userId, search });
}
