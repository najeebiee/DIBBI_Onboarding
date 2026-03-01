import Image from "next/image";

const roadmapItems = [
  {
    title: "Welcome Telegram Group",
    description:
      "Connect with other distributors and get real-time updates from the leadership team.",
    image: "/onboarding/roadmap-1.jpg",
  },
  {
    title: "Business Certification #1:",
    description:
      'The essential "getting started" guide. Learn how to navigate the system and set up your payouts.',
    image: "/onboarding/roadmap-2.jpg",
  },
  {
    title: "Product Specialist Certification: Product Knowledge",
    description:
      "Deep dive into the science and benefits of our products so you can recommend them with confidence.",
    image: "/onboarding/roadmap-3.jpg",
  },
  {
    title: "Online Marketing Certification:",
    description:
      "A simple, step-by-step guide to finding customers on Social Media, even if you have zero experience.",
    image: "/onboarding/roadmap-4.jpg",
  },
];

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#0A19D1] px-4 py-16 text-white sm:py-20"
    >
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="text-center text-3xl font-extrabold md:text-4xl lg:text-[50px]">
          Your Complete Onboarding Roadmap
        </h2>
        <p className="mx-auto mt-5 max-w-4xl text-center text-sm leading-relaxed text-white/90 md:text-base lg:text-[18px]">
          Getting certified as a Lead Generator is just the beginning. Here is exactly
          what else you will unlock inside your Onboarding Dashboard:
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {roadmapItems.map((item) => (
            <article key={item.title} className="mx-auto w-full max-w-[680px] space-y-4">
              <Image
                src={item.image}
                alt={item.title}
                width={960}
                height={540}
                className="h-auto w-full rounded-xl object-contain"
              />
              <p className="flex gap-3 text-sm leading-relaxed text-white md:text-base lg:text-[18px]">
                <span className="mt-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5C400] text-[10px] font-bold text-[#0B0F2E]">
                  ✓
                </span>
                <span>
                  <strong>{item.title}</strong> {item.description}
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
