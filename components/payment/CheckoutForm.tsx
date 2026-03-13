"use client";

import { FormEvent, useState } from "react";
import LoadingButton from "@/components/ui/LoadingButton";

type CreateInvoiceResponse = {
  success: boolean;
  invoiceUrl?: string;
  error?: string;
};

type CheckoutFormProps = {
  courseSlug: string;
  buttonLabel: string;
  inputClassName?: string;
  buttonClassName?: string;
  wrapperClassName?: string;
  defaultEmail?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutForm({
  courseSlug,
  buttonLabel,
  inputClassName,
  buttonClassName,
  wrapperClassName,
  defaultEmail = "",
}: CheckoutFormProps) {
  const [buyerEmail, setBuyerEmail] = useState(defaultEmail);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const normalizedEmail = buyerEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          buyerEmail: normalizedEmail,
        }),
      });

      const payload = (await response.json()) as CreateInvoiceResponse;

      if (!response.ok || !payload.success || !payload.invoiceUrl) {
        setErrorMessage(payload.error ?? "Unable to initialize secure payment.");
        setIsLoading(false);
        return;
      }

      window.location.href = payload.invoiceUrl;
    } catch {
      setErrorMessage("Something went wrong while preparing payment.");
      setIsLoading(false);
    }
  }

  return (
    <form className={wrapperClassName} onSubmit={handleSubmit} noValidate>
      <label htmlFor="buyer-email" className="sr-only">
        Buyer email
      </label>
      <input
        id="buyer-email"
        name="buyer-email"
        type="email"
        autoComplete="email"
        value={buyerEmail}
        onChange={(event) => setBuyerEmail(event.target.value)}
        placeholder="Enter your email for receipt and access code"
        disabled={isLoading}
        required
        className={
          inputClassName ??
          "h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#0b63ff] focus:ring-2 focus:ring-[#0b63ff]/15"
        }
      />

      <LoadingButton
        type="submit"
        isLoading={isLoading}
        loadingLabel="Processing..."
        className={
          buttonClassName ??
          "mt-3 h-12 w-full rounded-lg bg-[#16A34A] px-4 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {buttonLabel}
      </LoadingButton>

      {errorMessage && (
        <p className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
