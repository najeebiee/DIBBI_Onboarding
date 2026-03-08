import Image from "next/image";
import Link from "next/link";
import type { CoursesTab } from "@/types/course";

type CoursesPageHeaderProps = {
  activeTab: CoursesTab;
  query: string;
  userInitial: string;
};

function buildTabHref(tab: CoursesTab, query: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (query.trim()) {
    params.set("q", query.trim());
  }
  return `/courses?${params.toString()}`;
}

function buildTopCoursesHref(query: string) {
  const params = new URLSearchParams();
  params.set("tab", "enrollments");
  if (query.trim()) {
    params.set("q", query.trim());
  }
  return `/courses?${params.toString()}`;
}

function tabClass(isActive: boolean) {
  if (isActive) {
    return "relative py-5 text-[15px] font-semibold text-[#102754] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-[#0b63ff]";
  }
  return "py-5 text-[15px] font-semibold text-[#6e7f9c] transition hover:text-[#102754]";
}

export default function CoursesPageHeader({
  activeTab,
  query,
  userInitial,
}: CoursesPageHeaderProps) {
  const shellClass = "mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10";

  return (
    <header className="w-full overflow-hidden border-b border-[#d6deec] bg-white shadow-[0_6px_20px_rgba(15,40,87,0.06)]">
      <div className="bg-[#081f5a]">
        <div className={`${shellClass} flex h-16 items-center justify-between`}>
          <Link href="/courses?tab=enrollments" className="inline-flex items-center">
            <Image
              src="/onboarding/dibbi_logo.png"
              alt="DIBBI"
              width={74}
              height={26}
              className="h-auto w-[72px]"
              priority
            />
          </Link>

          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href={buildTopCoursesHref(query)}
              className="inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-sm font-semibold text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-none stroke-current"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              <span className="hidden sm:inline">Courses</span>
            </Link>

            <button
              type="button"
              aria-label="Notifications"
              className="text-white/95 transition hover:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current"
                strokeWidth="2"
              >
                <path d="M15 17H5l1.4-1.4a2 2 0 0 0 .6-1.4V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4Z" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </button>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-xs font-bold text-white">
              {userInitial}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div
          className={`${shellClass} flex flex-col gap-3 py-3 xl:h-[70px] xl:flex-row xl:items-center xl:justify-between xl:py-0`}
        >
          <nav className="flex items-center gap-8">
            <Link href={buildTabHref("enrollments", query)} className={tabClass(activeTab === "enrollments")}>
              Enrollments
            </Link>
            <Link href={buildTabHref("explore", query)} className={tabClass(activeTab === "explore")}>
              Explore
            </Link>
          </nav>

          <form action="/courses" method="get" className="flex w-full gap-2 xl:w-auto">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative flex-1 xl:min-w-[310px]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-[#6f809b]"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search your course..."
                className="h-11 w-full rounded-lg border border-[#d8e0ed] bg-white pl-9 pr-3 text-sm text-[#102754] outline-none transition placeholder:text-[#93a0b8] focus:border-[#0b63ff] focus:ring-2 focus:ring-[#0b63ff]/10"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#0b63ff] px-5 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
