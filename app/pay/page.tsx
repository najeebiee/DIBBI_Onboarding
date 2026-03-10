import CheckoutForm from "@/components/payment/CheckoutForm";

const COURSE_SLUG = "dibbi-onboarding-certification";

export default function PayPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Secure Checkout</h1>
        <p className="mt-3 text-slate-600">
          Enter your buyer email to create your payment invoice and receive your
          one-time course access code after payment is confirmed.
        </p>

        <CheckoutForm
          courseSlug={COURSE_SLUG}
          buttonLabel="Continue to Secure Payment"
          wrapperClassName="mt-6"
        />
      </div>
    </main>
  );
}