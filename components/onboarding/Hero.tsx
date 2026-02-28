"use client";

import Image from "next/image";

export default function Hero() {
  const handleScrollToBenefits = () => {
    document.getElementById("benefits")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#060B3A] px-4 py-16 text-white sm:py-20"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
          CLG Onboarding
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Become a Certified Lead Generator (Lieutenant)
        </h1>
        <p className="mt-5 max-w-3xl text-base text-white/80 sm:text-lg">
          Follow a clear system to build prospecting confidence, sharpen outreach, and
          launch your client acquisition engine.
        </p>
        <p className="mt-3 text-base italic text-white/80 sm:text-lg">
          Start where you are. Grow fast with structure.
        </p>

        <div className="mt-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-blue-700/60 bg-blue-900/40 shadow-xl">
          <Image
            src="/onboarding/hero-mockup.png"
            alt="Certified Lead Generator onboarding dashboard mockup"
            width={1400}
            height={860}
            className="h-auto w-full"
            priority
          />
        </div>

        <button
          type="button"
          onClick={handleScrollToBenefits}
          className="mt-8 w-full max-w-xl rounded-full bg-[#F5C400] px-8 py-4 text-center text-lg font-extrabold text-[#0B0F2E] shadow-lg transition hover:brightness-105"
        >
          Yes, Start My Onboarding
        </button>
      </div>
    </section>
  );
}
