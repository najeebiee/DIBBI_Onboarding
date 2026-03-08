type CourseProgressBarProps = {
  percent: number;
};

export default function CourseProgressBar({ percent }: CourseProgressBarProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#dde6f2]">
        <div
          className="h-full rounded-full bg-[#0b63ff] transition-all"
          style={{ width: `${safePercent}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[#5f708b]">{safePercent}%</span>
    </div>
  );
}
