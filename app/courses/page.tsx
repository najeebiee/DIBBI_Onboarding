import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CourseGrid from "@/components/courses/CourseGrid";
import CoursesPageHeader from "@/components/courses/CoursesPageHeader";
import { getCoursesPageData } from "@/lib/courses/queries";
import {
  createServerSupabaseClient,
  getServerAccessToken,
} from "@/lib/supabase/server";
import type { CoursesTab } from "@/types/course";

type CoursesPageProps = {
  searchParams: Promise<{
    tab?: string;
    q?: string;
  }>;
};

function normalizeTab(tab: string | undefined): CoursesTab {
  return tab === "explore" ? "explore" : "enrollments";
}

function normalizeSearch(search: string | undefined): string {
  return search?.trim() ?? "";
}

function getUserInitial(email: string | undefined): string {
  if (!email) return "U";
  const initial = email.trim().charAt(0).toUpperCase();
  return initial || "U";
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const activeTab = normalizeTab(params.tab);
  const query = normalizeSearch(params.q);

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

  const user = userResult.data.user;
  const courses = await getCoursesPageData({
    supabase,
    userId: user.id,
    tab: activeTab,
    search: query,
  });

  return (
    <main className="min-h-screen bg-[#eef3fa]">
      <CoursesPageHeader
        activeTab={activeTab}
        query={query}
        userInitial={getUserInitial(user.email)}
      />
      <section className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-8 sm:px-6 lg:px-10">
        <CourseGrid courses={courses} tab={activeTab} query={query} />
      </section>
    </main>
  );
}
