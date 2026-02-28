import Image from "next/image";

const modules = [
  {
    title: "Module 1: Foundation & Positioning",
    image: "/onboarding/module-1.jpg",
    bullet: "Define your offer and ideal lead profile.",
  },
  {
    title: "Module 2: Outreach Messaging",
    image: "/onboarding/module-2.jpg",
    bullet: "Craft scripts that spark qualified responses.",
  },
  {
    title: "Module 3: Conversation Flow",
    image: "/onboarding/module-3.jpg",
    bullet: "Handle objections and move prospects forward.",
  },
  {
    title: "Module 4: Pipeline Discipline",
    image: "/onboarding/module-4.jpg",
    bullet: "Track activity and maintain consistent momentum.",
  },
];

export default function Modules() {
  return (
    <section id="modules" className="py-14 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold uppercase tracking-wide text-slate-900 sm:text-4xl">
          What You Will Master
        </h2>

        <div className="mt-10 flex flex-col items-center gap-8">
          {modules.map((module, index) => (
            <article
              key={module.title}
              className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Image
                src={module.image}
                alt={module.title}
                width={1200}
                height={720}
                className="h-auto w-full"
              />
              <div className="bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                The Certified Lead Generator (Lieutenant)
              </div>
              <div className="space-y-3 px-5 py-5 sm:px-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Module {index + 1}: {module.title.split(": ")[1]}
                </h3>
                <p className="flex items-start gap-2 text-slate-700">
                  <span className="mt-0.5 text-base font-bold text-blue-700">✓</span>
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
