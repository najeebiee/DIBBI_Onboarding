import { redirect } from "next/navigation";

export default function OnboardingLoginRedirectPage() {
  redirect("/login");
}
