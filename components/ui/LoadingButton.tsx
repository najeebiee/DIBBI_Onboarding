import type { ButtonHTMLAttributes, ReactNode } from "react";

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingLabel: string;
  spinnerClassName?: string;
  children: ReactNode;
};

function joinClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export default function LoadingButton({
  isLoading = false,
  loadingLabel,
  spinnerClassName,
  className,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={className}
    >
      <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
        {isLoading ? (
          <span
            aria-hidden="true"
            className={joinClassNames(
              "h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
              spinnerClassName,
            )}
          />
        ) : null}
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          {isLoading ? loadingLabel : children}
        </span>
      </span>
    </button>
  );
}
