import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLG Onboarding",
  description: "Certified Lead Generator Onboarding",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}