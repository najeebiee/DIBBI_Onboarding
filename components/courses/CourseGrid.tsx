import CourseCard from "@/components/courses/CourseCard";
import type { CourseListItem, CoursesTab } from "@/types/course";

type CourseGridProps = {
  courses: CourseListItem[];
  tab: CoursesTab;
  query: string;
};

export default function CourseGrid({ courses, tab, query }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-[#dbe3f0] bg-white px-6 py-10 text-center">
        <p className="text-lg font-semibold text-[#102754]">
          {tab === "enrollments" ? "No enrolled courses found." : "No courses found."}
        </p>
        <p className="mt-2 text-sm text-[#60728d]">
          {query
            ? `No results match "${query}".`
            : tab === "enrollments"
              ? "Courses you unlock will appear here."
              : "Published courses will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} isExploreTab={tab === "explore"} />
      ))}
    </div>
  );
}
