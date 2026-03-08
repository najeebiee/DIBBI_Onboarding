import Link from "next/link";
import type { CourseLessonItem } from "@/types/course-page";

type CourseLessonListProps = {
  lessons: CourseLessonItem[];
};

export default function CourseLessonList({ lessons }: CourseLessonListProps) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-xl border border-[#e2e9f4] bg-[#f8fbff] px-3 py-4 text-center text-sm text-[#60728d]">
        No lessons available yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e2e9f4] bg-[#f8fbff] px-3 py-2">
      <h3 className="px-1 pb-2 pt-1 text-sm font-semibold text-[#122c5b]">Lessons</h3>
      <ul className="space-y-1.5">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={lesson.href}
              className={`inline-flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1 text-left text-sm ${
                lesson.isActive
                  ? "font-semibold text-[#0b63ff]"
                  : "font-medium text-[#4e6382] hover:bg-[#edf3fc]"
              }`}
              aria-current={lesson.isActive ? "page" : undefined}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    lesson.isActive ? "bg-[#0b63ff]" : "bg-[#c8d5e8]"
                  }`}
                />
                <span className="truncate">
                  {lesson.lessonNumber}. {lesson.title}
                </span>
              </span>
              {lesson.isCompleted ? (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e9f8ef] px-1 text-[10px] font-bold text-[#17834f]">
                  ✓
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
