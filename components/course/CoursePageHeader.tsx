import Image from "next/image";
import Link from "next/link";

type CoursePageHeaderProps = {
  courseTitle: string;
  userInitial: string;
};

export default function CoursePageHeader({
  courseTitle,
  userInitial,
}: CoursePageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-[#d6deec] bg-white/95 shadow-[0_6px_20px_rgba(15,40,87,0.06)] backdrop-blur">
      <div className="bg-[#081f5a]">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
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
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Course Workspace
              </p>
              <p className="truncate text-sm font-semibold text-white sm:text-base">
                {courseTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/courses?tab=enrollments"
              className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Courses
            </Link>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
              {userInitial}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link
          href="/courses?tab=enrollments"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-[#d7e2f0] bg-[#f7faff] px-4 text-sm font-semibold text-[#102754] transition hover:border-[#bfd0ea] hover:bg-[#f1f6ff]"
        >
          <span aria-hidden="true" className="mr-2 text-base leading-none">
            &larr;
          </span>
          Back to Courses
        </Link>

        <nav className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-[#6a7f9f]">
          <Link href="/courses?tab=enrollments" className="transition hover:text-[#102754]">
            Courses
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-[#102754]">{courseTitle}</span>
        </nav>
      </div>
    </header>
  );
}
