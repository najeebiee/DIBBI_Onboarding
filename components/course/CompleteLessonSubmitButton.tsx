"use client";

import { useFormStatus } from "react-dom";
import LoadingButton from "@/components/ui/LoadingButton";

export default function CompleteLessonSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <LoadingButton
      type="submit"
      isLoading={pending}
      loadingLabel="Saving..."
      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0b63ff] px-4 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[#8bb8ff]"
    >
      Mark as Complete
    </LoadingButton>
  );
}
