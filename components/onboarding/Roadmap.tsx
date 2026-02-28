import Image from "next/image";

const roadmapItems = [
  {
    title: "Orientation & Setup",
    description: "Get your dashboard configured and understand the certification journey.",
    image: "/onboarding/hero-mockup.png",
  },
  {
    title: "Skill Block: Outreach",
    description: "Learn the messaging frameworks and cadences used by top performers.",
    image: "/onboarding/module-1.jpg",
  },
  {
    title: "Skill Block: Qualification",
    description: "Practice lead qualification so you spend time on real opportunities.",
    image: "/onboarding/module-2.jpg",
  },
  {
    title: "Certification Sprint",
    description: "Complete checkpoints, submit milestones, and unlock your next level.",
    image: "/onboarding/module-3.jpg",
  },
];

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#060B3A] px-4 py-16 text-white sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-3xl font-bold sm:text-4xl">Your Complete Onboarding Roadmap</h2>
        <p className="mt-3 max-w-3xl text-white/80 sm:text-lg">
          Move through each stage with clear expectations, practical assignments, and
          momentum-focused milestones.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {roadmapItems.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl border border-blue-700/60 bg-blue-950/40"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={960}
                height={540}
                className="h-44 w-full object-cover"
              />
              <div className="px-5 py-5">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 flex gap-2 text-white/80">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-300" />
                  <span>{item.description}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
