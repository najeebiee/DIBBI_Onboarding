"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section
      id="top"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#060B3A] px-4 py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <h1 className="max-w-4xl text-3xl font-extrabold leading-tight md:text-4xl lg:text-[50px]">
          Start Your Journey: Unlock Your Onboarding Dashboard & Become a Certified
          Lead Generator
        </h1>
        <p className="mt-6 max-w-4xl text-base leading-snug text-white/80 md:text-xl lg:text-[30px]">
          Master the #1 skill in network marketing, filling the room with qualified
          prospects for official GutGuard events, without ever feeling \"pushy\" or
          \"salesy.\"
        </p>
        <p className="mt-6 max-w-3xl text-base italic leading-snug text-white/80 md:text-xl lg:text-[30px]">
          Enroll today to unlock your private dashboard, access your training, and join
          our community.
        </p>

        <div className="mt-8 w-full max-w-md overflow-hidden rounded-2xl md:max-w-xl lg:max-w-2xl">
          <Image
            src="/onboarding/hero_mockup.png"
            alt="Certified Lead Generator onboarding dashboard mockup"
            width={1400}
            height={860}
            className="h-auto w-full"
            priority
          />
        </div>

        <button
          type="button"
          onClick={() => router.push("/pay")}
          className="mt-8 w-full max-w-md rounded-full bg-[#F5C400] px-6 py-3 text-center text-base font-extrabold text-[#0B0F2E] shadow-lg transition hover:brightness-105 md:max-w-2xl md:px-8 md:py-4 md:text-lg lg:mt-10 lg:max-w-4xl lg:py-5 lg:text-xl"
        >
          Get Instant Access & Start My Certification for P499
        </button>
      </div>
    </section>
  );
}
