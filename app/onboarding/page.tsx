import Benefits from "@/components/onboarding/Benefits";
import Footer from "@/components/onboarding/Footer";
import Hero from "@/components/onboarding/Hero";
import Intro from "@/components/onboarding/Intro";
import Modules from "@/components/onboarding/Modules";
import Roadmap from "@/components/onboarding/Roadmap";

export default function OnboardingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Intro />
      <Modules />
      <Roadmap />
      <Benefits />
      <Footer />
    </div>
  );
}