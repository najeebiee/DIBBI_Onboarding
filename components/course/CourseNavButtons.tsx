import Link from "next/link";

type CourseNavButtonsProps = {
  previousHref: string | null;
  nextHref: string | null;
};

export default function CourseNavButtons({
  previousHref,
  nextHref,
}: CourseNavButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {previousHref ? (
        <Link
          href={previousHref}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#d9e3f2] bg-[#f2f6fc] text-sm font-semibold text-[#4e6382] transition hover:bg-[#e9f0fb]"
        >
          Previous
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center justify-center rounded-lg border border-[#d9e3f2] bg-[#f2f6fc] text-sm font-semibold text-[#8ca0bf]">
          Previous
        </span>
      )}

      {nextHref ? (
        <Link
          href={nextHref}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0b63ff] text-sm font-semibold text-white transition hover:brightness-105"
        >
          Next
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center justify-center rounded-lg bg-[#8bb8ff] text-sm font-semibold text-white">
          Next
        </span>
      )}
    </div>
  );
}
