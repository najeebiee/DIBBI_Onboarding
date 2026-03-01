"use client";

import { useEffect, useRef, useState } from "react";

type InvoiceResponse = {
  invoiceId: string;
  invoiceUrl: string;
  externalId: string;
};

function randomSuffix(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

export default function PayPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRequestedRef = useRef(false);

  const createInvoiceAndRedirect = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 499,
          description: "Onboarding Certification #1",
          externalIdSuffix: randomSuffix(8),
        }),
      });

      const data = (await response.json()) as
        | InvoiceResponse
        | { error?: string; details?: unknown };

      if (!response.ok || !("invoiceUrl" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Unable to initialize secure payment.",
        );
      }

      window.location.href = data.invoiceUrl;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while preparing payment.";
      setError(message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    void createInvoiceAndRedirect();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Redirecting to secure payment...
        </h1>
        <p className="mt-3 text-slate-600">
          Please wait while we prepare your secure Xendit checkout session.
        </p>

        {isLoading && !error && (
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            <span>Creating invoice and redirecting...</span>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void createInvoiceAndRedirect()}
              className="mt-3 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
