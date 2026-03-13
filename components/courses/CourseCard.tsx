import Image from "next/image";
import CourseProgressBar from "@/components/courses/CourseProgressBar";
import LoadingLink from "@/components/ui/LoadingLink";
import type { CourseListItem } from "@/types/course";

type CourseCardProps = {
  course: CourseListItem;
  isExploreTab: boolean;
};

function truncateDescription(text: string | null): string {
  if (!text) return "Continue your learning journey with this course.";
  if (text.length <= 160) return text;
  return `${text.slice(0, 157)}...`;
}

export default function CourseCard({ course, isExploreTab }: CourseCardProps) {
  const ctaLabel = course.isUnlocked ? "Open" : "Get Access";
  const ctaHref = course.isUnlocked ? `/course/${course.slug}` : "/pay";
  const description = truncateDescription(course.description);

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(17,41,85,0.08)]">
      <div className="relative h-[200px] w-full bg-[#dce6f7]">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#d9e7ff] to-[#f1f6ff] px-6 text-center text-lg font-semibold text-[#284e9d]">
            {course.title}
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-bold leading-6 text-[#0d2350]">
            {course.title}
          </h3>
          <p className="text-sm font-semibold text-[#0b63ff]">{course.author || "DIBBI"}</p>
          <p className="min-h-[66px] text-sm leading-6 text-[#5f708b]">{description}</p>
        </div>

        <CourseProgressBar percent={course.progressPercent} />

        <div className="flex items-center justify-between pt-1">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-[#6a7f9f]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-none stroke-current"
              strokeWidth="2"
            >
              <rect x="4" y="5" width="16" height="14" rx="2" />
              <path d="M8 9h8M8 13h5" />
            </svg>
            <span>{course.totalLessons} lessons</span>
          </p>

          <LoadingLink
            href={ctaHref}
            loadingLabel={course.isUnlocked ? "Loading..." : "Redirecting..."}
            disabledClassName="pointer-events-none cursor-not-allowed opacity-70"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b63ff] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {isExploreTab && !course.isUnlocked ? "Get Access" : ctaLabel}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-none stroke-current"
              strokeWidth="2.2"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </LoadingLink>
        </div>
      </div>
    </article>
  );
}
