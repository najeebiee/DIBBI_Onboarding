const benefits = [
  "Build a repeatable system for attracting qualified leads.",
  "Gain practical scripts and frameworks you can use immediately.",
  "Increase confidence in outreach and prospect conversations.",
  "Unlock a clear path toward certification and role advancement.",
];

export default function Benefits() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Why Become a Lieutenant?
        </h2>

        <ul className="mt-6 space-y-3 text-base text-slate-700 sm:text-lg">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="w-full max-w-2xl rounded-full bg-yellow-400 px-8 py-4 text-center text-lg font-semibold text-slate-900 shadow-md transition hover:brightness-105"
          >
            Yes, Unlock My Dashboard & Certification
          </button>
        </div>
      </div>
    </section>
  );
}