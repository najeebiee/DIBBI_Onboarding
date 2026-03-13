"use client";

import Link, { type LinkProps } from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";

type LoadingLinkProps = LinkProps & {
  className?: string;
  loadingLabel: string;
  disabledClassName?: string;
  spinnerClassName?: string;
  children: ReactNode;
};

function joinClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export default function LoadingLink({
  className,
  loadingLabel,
  disabledClassName,
  spinnerClassName,
  children,
  onClick,
  ...props
}: LoadingLinkProps) {
  const [isLoading, setIsLoading] = useState(false);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedEvent(event)) {
      return;
    }
    if (isLoading) {
      event.preventDefault();
      return;
    }
    setIsLoading(true);
  }

  return (
    <Link
      {...props}
      aria-busy={isLoading}
      aria-disabled={isLoading}
      onClick={handleClick}
      className={joinClassNames(className, isLoading && disabledClassName)}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {isLoading ? (
          <span
            aria-hidden="true"
            className={joinClassNames(
              "h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
              spinnerClassName,
            )}
          />
        ) : null}
        <span>{isLoading ? loadingLabel : children}</span>
      </span>
    </Link>
  );
}
