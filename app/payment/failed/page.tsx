import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-rose-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-rose-700">Payment Failed</h1>
        <p className="mt-3 text-slate-600">
          We could not complete your payment. Please try again from onboarding.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
        >
          Back to Onboarding
        </Link>
      </div>
    </main>
  );
}
