import Image from "next/image";

const modules = [
  {
    title: "Module 1: Builder Identity & TRIAD",
    image: "/onboarding/module-1.jpeg",
    bullet:
      'Stop thinking like a salesperson and start thinking like a Consultant. Learn the "TRIAD" skill of Marketing Lead Generation.',
  },
  {
    title: "Module 2: Prospecting & Profiling",
    image: "/onboarding/module-2.jpeg",
    bullet:
      'Never run out of names. Learn how to identify the "perfect prospect" for GutGuard so you stop wasting time on people who aren\'t interested.',
  },
  {
    title: "Module 3: Inviting to Events",
    image: "/onboarding/module-3.jpeg",
    bullet:
      'The "Magic Scripts" that turn a casual conversation into a confirmed seat at an event.',
  },
  {
    title: "Module 4: Event Participation (The Observer)",
    image: "/onboarding/module-4.jpeg",
    bullet:
      'Learn the art of the "Non-Presenting Role." How to edify the speaker, how to sit, and how to create social proof just by being there.',
  },
];

export default function Modules() {
  return (
    <section
      id="modules"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#ececec] px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-extrabold uppercase leading-tight tracking-wide text-slate-900 md:text-4xl lg:text-[50px]">
          What You Will Master
        </h2>

        <div className="mt-10 flex flex-col items-center gap-6">
          {modules.map((module) => (
            <article
              key={module.title}
              className="w-full max-w-2xl overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm"
            >
              <Image
                src={module.image}
                alt={module.title}
                width={1200}
                height={720}
                className="h-52 w-full object-cover md:h-60 lg:h-auto"
              />
              <div className="bg-[#0A19D1] px-4 py-1.5 text-center text-[14px] font-bold text-white">
                The Certified Lead Generator (Lieutenant)
              </div>
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <h3 className="text-xl font-bold leading-tight text-slate-900 md:text-2xl lg:text-[34px]">
                  {module.title}
                </h3>
                <p className="flex items-start gap-2 text-sm leading-snug text-slate-700 md:text-base lg:text-[18px]">
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
                  <span>{module.bullet}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
