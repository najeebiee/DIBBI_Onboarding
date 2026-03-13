import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CourseContentPanel from "@/components/course/CourseContentPanel";
import CoursePageHeader from "@/components/course/CoursePageHeader";
import CourseSidebar from "@/components/course/CourseSidebar";
import { markLessonCompleteAction } from "@/app/course/[slug]/actions";
import {
  CourseAccessDeniedError,
  CourseNotFoundError,
  getCoursePageData,
} from "@/lib/course/queries";
import {
  createServerSupabaseClient,
  getServerAccessToken,
} from "@/lib/supabase/server";

type CourseDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lesson?: string | string[];
  }>;
};

function parseLessonNumber(rawLesson: string | string[] | undefined): number | null {
  const raw = Array.isArray(rawLesson) ? rawLesson[0] : rawLesson;
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  const lessonNumber = Math.trunc(parsed);
  return lessonNumber > 0 ? lessonNumber : null;
}

function getUserInitial(email: string | undefined): string {
  if (!email) return "U";
  const initial = email.trim().charAt(0).toUpperCase();
  return initial || "U";
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: CourseDetailPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const lessonNumber = parseLessonNumber(query.lesson);

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

  let coursePageData;
  try {
    coursePageData = await getCoursePageData({
      supabase,
      userId: userResult.data.user.id,
      slug,
      lessonNumber,
    });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      notFound();
    }
    if (error instanceof CourseAccessDeniedError) {
      redirect("/courses?tab=explore");
    }
    throw error;
  }

  return (
    <main className="min-h-screen bg-[#eef3fa]">
      <CoursePageHeader
        courseTitle={coursePageData.courseTitle}
        progressPercent={coursePageData.sidebar.progressPercent}
        completedLessons={coursePageData.sidebar.completedLessons}
        totalLessons={coursePageData.sidebar.totalLessons}
        userInitial={getUserInitial(userResult.data.user.email)}
      />
      <section className="mx-auto w-full max-w-screen-2xl px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[320px_1fr] lg:gap-8 xl:grid-cols-[340px_1fr]">
          <CourseSidebar
            coachName={coursePageData.sidebar.coachName}
            coachAvatarUrl={coursePageData.sidebar.coachAvatarUrl}
            progressPercent={coursePageData.sidebar.progressPercent}
            completedLessons={coursePageData.sidebar.completedLessons}
            totalLessons={coursePageData.sidebar.totalLessons}
            lessons={coursePageData.sidebar.lessons}
            previousLessonHref={coursePageData.sidebar.previousLessonHref}
            nextLessonHref={coursePageData.sidebar.nextLessonHref}
          />
          <CourseContentPanel
            selectedLesson={coursePageData.selectedLesson}
            courseSlug={coursePageData.courseSlug}
            markCompleteAction={markLessonCompleteAction}
          />
        </div>
      </section>
    </main>
  );
}
