export type CourseLessonItem = {
  id: string;
  lessonNumber: number;
  title: string;
  description: string | null;
  contentUrl: string | null;
  isCompleted: boolean;
  isActive: boolean;
  href: string;
};

export type CourseSidebarData = {
  coachName: string;
  coachAvatarUrl?: string | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lessons: CourseLessonItem[];
  previousLessonHref: string | null;
  nextLessonHref: string | null;
};

export type CourseSelectedLesson = {
  id: string;
  lessonNumber: number;
  title: string;
  description: string | null;
  contentUrl: string | null;
  isCompleted: boolean;
};

export type CoursePageData = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  courseDescription: string | null;
  thumbnailUrl: string | null;
  sidebar: CourseSidebarData;
  selectedLesson: CourseSelectedLesson | null;
};
