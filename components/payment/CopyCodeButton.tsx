"use client";

import { useState } from "react";

type CopyCodeButtonProps = {
  code: string;
};

export default function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="rounded-lg bg-[#0b63ff] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
    >
      {copied ? "Copied" : "Copy Code"}
    </button>
  );
}