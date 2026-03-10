import LoginForm from "@/components/auth/LoginForm";
import { normalizeAccessCode } from "@/lib/xendit/utils";

type LoginPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const code = normalizeAccessCode(params.code?.trim() ?? "");

  return (
    <main className="min-h-screen bg-[#eef2f6] px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
        <LoginForm defaultCode={code} />
      </div>
    </main>
  );
}
