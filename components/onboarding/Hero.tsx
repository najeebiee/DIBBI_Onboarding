import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-blue-950 px-4 py-16 text-white sm:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
          CLG Onboarding
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Become a Certified Lead Generator (Lieutenant)
        </h1>
        <p className="mt-5 max-w-3xl text-base text-blue-100 sm:text-lg">
          Follow a clear system to build prospecting confidence, sharpen outreach, and
          launch your client acquisition engine.
        </p>
        <p className="mt-3 text-base italic text-blue-200 sm:text-lg">
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
          className="mt-8 w-full max-w-xl rounded-full bg-yellow-400 px-8 py-4 text-center text-lg font-semibold text-slate-900 shadow-md transition hover:brightness-105"
        >
          Yes, Start My Onboarding
        </button>
      </div>
    </section>
  );
}