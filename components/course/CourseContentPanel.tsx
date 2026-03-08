import CompleteLessonSubmitButton from "@/components/course/CompleteLessonSubmitButton";
import type { CourseSelectedLesson } from "@/types/course-page";

type CourseContentPanelProps = {
  selectedLesson: CourseSelectedLesson | null;
  courseSlug: string;
  markCompleteAction: (formData: FormData) => Promise<void>;
};

type ContentDisplayMode = "empty" | "content-url" | "placeholder";

function getContentDisplayMode(
  lesson: CourseSelectedLesson | null,
): ContentDisplayMode {
  if (!lesson) return "empty";
  return lesson.contentUrl?.trim() ? "content-url" : "placeholder";
}

export default function CourseContentPanel({
  selectedLesson,
  courseSlug,
  markCompleteAction,
}: CourseContentPanelProps) {
  const mode = getContentDisplayMode(selectedLesson);

  if (mode === "empty" || !selectedLesson) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_rgba(20,45,99,0.08)] sm:p-8">
        <h2 className="text-2xl font-bold text-[#102754]">No lessons available yet</h2>
        <p className="mt-2 text-sm leading-6 text-[#60728d]">
          This course does not have any published lessons yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_rgba(20,45,99,0.08)] sm:p-8">
      {mode === "content-url" ? (
        <div className="mb-6 rounded-xl border border-[#d7e3f5] bg-[#f3f7fd] p-5 sm:p-6">
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-[#bcd0ec] bg-[#eaf1fc] sm:h-[280px] lg:h-[340px]">
            <div className="px-6 text-center">
              <p className="text-sm font-semibold text-[#1f4a8e]">Content available</p>
              <p className="mt-2 break-all text-xs text-[#60728d]">
                {selectedLesson.contentUrl}
              </p>
              <p className="mt-3 text-xs text-[#6f83a3]">
                Playback or embed behavior can be added in a later batch.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-dashed border-[#c9d7eb] bg-[#f3f7fd] p-5 sm:p-6">
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-[#c7d6ea] bg-[#edf3fc] sm:h-[240px] lg:h-[280px]">
            <p className="px-6 text-center text-sm font-medium text-[#6a7f9f]">
              Lesson content preview area
            </p>
          </div>
        </div>
      )}

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#0b63ff]">
          Lesson {selectedLesson.lessonNumber}
        </p>
        <h2 className="text-2xl font-bold text-[#102754]">{selectedLesson.title}</h2>
        {selectedLesson.description ? (
          <p className="mt-2 text-sm leading-6 text-[#60728d]">
            {selectedLesson.description}
          </p>
        ) : null}
      </header>

      <div className="mt-4">
        {selectedLesson.isCompleted ? (
          <span className="inline-flex h-10 items-center justify-center rounded-lg bg-[#e9f8ef] px-4 text-sm font-semibold text-[#17834f]">
            Completed
          </span>
        ) : (
          <form action={markCompleteAction}>
            <input type="hidden" name="courseSlug" value={courseSlug} />
            <input type="hidden" name="lessonId" value={selectedLesson.id} />
            <CompleteLessonSubmitButton />
          </form>
        )}
      </div>

      <div className="mt-6 space-y-4 text-sm leading-7 text-[#4d6282] sm:text-[15px]">
        <h3 className="text-base font-semibold text-[#102754]">Overview</h3>
        <p>
          This lesson is part of your onboarding journey and is structured to
          help you build a clear understanding of the key concepts before moving
          to the next section.
        </p>
        <p>
          Focus on the core ideas introduced here, then review how they connect
          to the bigger course path. Future updates will load richer content
          formats in this panel, including media and interactive materials.
        </p>
        <p>
          For now, this space provides a stable reading layout so every lesson
          can be presented consistently, whether the source is video, article,
          document, or assessment content.
        </p>
      </div>
    </section>
  );
}
