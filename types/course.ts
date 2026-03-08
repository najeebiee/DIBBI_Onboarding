export type CoursesTab = "enrollments" | "explore";

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  author: string | null;
  isUnlocked: boolean;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
};
