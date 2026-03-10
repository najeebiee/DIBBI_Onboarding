import Link from "next/link";
import CopyCodeButton from "@/components/payment/CopyCodeButton";
import RefreshButton from "@/components/payment/RefreshButton";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    external_id?: string;
  }>;
};

type CourseOrderRow = {
  id: string;
  course_id: string;
  status: string;
  external_id: string;
};

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const externalId = params.external_id?.trim();

  if (!externalId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-amber-700">Missing payment reference</h1>
          <p className="mt-3 text-slate-600">
            We could not find your payment reference. Please return to onboarding and
            try again.
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

  const supabase = createServiceRoleClient();
  const orderResult = await supabase
    .from("course_orders")
    .select("id, course_id, status, external_id")
    .eq("external_id", externalId)
    .maybeSingle();

  if (orderResult.error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-rose-700">Unable to load payment status</h1>
          <p className="mt-3 text-slate-600">{orderResult.error.message}</p>
        </div>
      </main>
    );
  }

  if (!orderResult.data) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-amber-700">Order not found</h1>
          <p className="mt-3 text-slate-600">
            We could not find a local order for this payment reference.
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

  const order = orderResult.data as CourseOrderRow;

  const [courseResult, codeResult] = await Promise.all([
    supabase.from("courses").select("title, slug").eq("id", order.course_id).maybeSingle(),
    supabase
      .from("course_access_codes")
      .select("code")
      .eq("order_id", order.id)
      .maybeSingle(),
  ]);

  const courseTitle = courseResult.data?.title?.trim() || "DIBBI Course";

  if (order.status === "failed" || order.status === "expired") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-rose-700">Payment was not completed</h1>
          <p className="mt-3 text-slate-600">
            Your payment is marked as {order.status}. Please return to onboarding to try
            again.
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

  if (order.status === "pending") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-sky-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-sky-700">Processing your payment...</h1>
          <p className="mt-3 text-slate-600">
            We are still waiting for payment confirmation from Xendit. This usually takes a
            short moment.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <RefreshButton />
            <Link
              href="/onboarding"
              className="text-sm font-medium text-[#0b63ff] underline-offset-2 hover:underline"
            >
              Back to Onboarding
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (order.status === "paid" && !codeResult.data?.code) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-sky-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-sky-700">Payment confirmed</h1>
          <p className="mt-3 text-slate-600">
            Your payment is confirmed. We are still generating your one-time access code.
          </p>
          <div className="mt-6">
            <RefreshButton />
          </div>
        </div>
      </main>
    );
  }

  if (order.status !== "paid") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-sky-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-sky-700">Processing your payment...</h1>
          <p className="mt-3 text-slate-600">
            We are still syncing your payment status. Please refresh in a moment.
          </p>
          <div className="mt-6">
            <RefreshButton />
          </div>
        </div>
      </main>
    );
  }

  const accessCode = codeResult.data?.code ?? null;
  const encodedAccessCode = accessCode ? encodeURIComponent(accessCode) : null;
  const loginHref = encodedAccessCode ? `/login?code=${encodedAccessCode}` : "/login";
  const signupHref = encodedAccessCode ? `/signup?code=${encodedAccessCode}` : "/signup";
  const redeemHref = encodedAccessCode ? `/redeem-code?code=${encodedAccessCode}` : "/redeem-code";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-emerald-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-emerald-700">Payment Successful</h1>
        <p className="mt-3 text-slate-600">
          Your payment for <span className="font-semibold text-slate-900">{courseTitle}</span>{" "}
          is confirmed. Redeem this one-time access code after logging in.
        </p>

        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Your Access Code
          </p>
          <p className="mt-2 break-all text-2xl font-extrabold tracking-widest text-emerald-900">
            {accessCode}
          </p>
          {accessCode ? (
            <div className="mt-4">
              <CopyCodeButton code={accessCode} />
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={loginHref}
            className="rounded-lg bg-[#0b63ff] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Login
          </Link>
          <Link
            href={signupHref}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sign up
          </Link>
          <Link
            href={redeemHref}
            className="rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Redeem code
          </Link>
        </div>
      </div>
    </main>
  );
}
