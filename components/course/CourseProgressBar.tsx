type CourseProgressBarProps = {
  percent: number;
};

function clampPercent(percent: number): number {
  if (Number.isNaN(percent)) return 0;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export default function CourseProgressBar({ percent }: CourseProgressBarProps) {
  const safePercent = clampPercent(percent);

  return (
    <div className="space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#dbe4f2]">
        <div
          className="h-full rounded-full bg-[#0b63ff] transition-all"
          style={{ width: `${safePercent}%` }}
        />
      </div>
      <p className="text-center text-xs font-semibold text-[#5f708b]">{safePercent}%</p>
    </div>
  );
}
