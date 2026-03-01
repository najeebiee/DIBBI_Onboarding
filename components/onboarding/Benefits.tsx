import Link from "next/link";

const benefits = [
  {
    title: "Unlock Income:",
    text: "Access Retail Margins + Entry-Level Overrides immediately.",
  },
  {
    title: "Earn While You Learn:",
    text: "You bring the guests; the event converts them.",
  },
  {
    title: "Gain Authority:",
    text: "Become eligible to officially assist at events (non-presenting roles).",
  },
  {
    title: "Fast-Track Success:",
    text: "Complete the validation requirement (20-30 invites) to prove you are ready for Captain.",
  },
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#ececec] px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 md:text-4xl lg:text-[50px]">
          Why Become a Lieutenant?
        </h2>

        <ul className="mx-auto mt-8 max-w-4xl space-y-2 text-left text-sm leading-relaxed text-slate-800 md:text-base lg:text-[18px]">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A19D1] text-white">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  aria-hidden="true"
                >
                  <path
                    d="M4.5 10.5L8.25 14.25L15.5 6.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                <strong>{benefit.title}</strong> {benefit.text}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link
            href="/pay"
            className="mt-8 w-full max-w-md rounded-full bg-[#F5C400] px-6 py-3 text-center text-base font-extrabold text-[#0B0F2E] shadow-lg transition hover:brightness-105 md:max-w-2xl md:px-8 md:py-4 md:text-lg lg:mt-10 lg:max-w-4xl lg:py-5 lg:text-xl"
          >
            Yes, Unlock My Dashboard & Certification
          </Link>
        </div>
      </div>
    </section>
  );
}
