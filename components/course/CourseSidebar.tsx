import Image from "next/image";
import CourseLessonList from "@/components/course/CourseLessonList";
import CourseNavButtons from "@/components/course/CourseNavButtons";
import CourseProgressBar from "@/components/course/CourseProgressBar";
import type { CourseLessonItem } from "@/types/course-page";

type CourseSidebarProps = {
  coachName: string;
  coachAvatarUrl?: string | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lessons: CourseLessonItem[];
  previousLessonHref: string | null;
  nextLessonHref: string | null;
};

export default function CourseSidebar({
  coachName,
  coachAvatarUrl,
  progressPercent,
  completedLessons,
  totalLessons,
  lessons,
  previousLessonHref,
  nextLessonHref,
}: CourseSidebarProps) {
  return (
    <aside className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_rgba(20,45,99,0.08)]">
      <div className="flex flex-col items-center">
        {coachAvatarUrl ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
            <Image
              src={coachAvatarUrl}
              alt={`${coachName} avatar`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dfe8f7] text-xl font-bold text-[#42659f]">
            {coachName.charAt(0)}
          </div>
        )}
        <p className="mt-3 text-center text-base font-semibold text-[#122c5b]">
          {coachName}
        </p>
      </div>

      <div className="mt-5">
        <CourseNavButtons previousHref={previousLessonHref} nextHref={nextLessonHref} />
      </div>

      <div className="mt-5">
        <CourseProgressBar percent={progressPercent} />
        <p className="mt-2 text-center text-xs font-medium text-[#6a7f9f]">
          {completedLessons} of {totalLessons} lessons completed
        </p>
      </div>

      <div className="mt-5">
        <CourseLessonList lessons={lessons} />
      </div>
    </aside>
  );
}
