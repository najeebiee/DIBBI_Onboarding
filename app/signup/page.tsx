import SignupForm from "@/components/auth/SignupForm";
import { normalizeAccessCode } from "@/lib/xendit/utils";

type SignupPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const code = normalizeAccessCode(params.code?.trim() ?? "");

  return (
    <main className="min-h-screen bg-[#eef2f6] px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
        <SignupForm defaultCode={code} />
      </div>
    </main>
  );
}
