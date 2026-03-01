import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#031033] px-4 py-8 text-white sm:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
        <Image
          src="/onboarding/dibbi_logo.png"
          alt="DIBBI logo"
          width={120}
          height={37}
          className="h-[37px] w-[120px]"
        />
        <p className="text-[16px] text-white">
          DIBBI Copyright 2026 | Privacy Policy | Terms
        </p>
      </div>
    </footer>
  );
}
