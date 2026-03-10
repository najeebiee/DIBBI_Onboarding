import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RedeemCodeForm from "@/components/payment/RedeemCodeForm";
import {
  createServerSupabaseClient,
  getServerAccessToken,
} from "@/lib/supabase/server";
import { normalizeAccessCode } from "@/lib/xendit/utils";

type RedeemCodePageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function RedeemCodePage({ searchParams }: RedeemCodePageProps) {
  const params = await searchParams;
  const code = normalizeAccessCode(params.code?.trim() ?? "");
  const loginHref = code ? `/login?code=${encodeURIComponent(code)}` : "/login";
  const cookieStore = await cookies();
  const accessToken = getServerAccessToken(cookieStore);

  if (!accessToken) {
    redirect(loginHref);
  }

  const supabase = createServerSupabaseClient(accessToken);
  const userResult = await supabase.auth.getUser(accessToken);

  if (userResult.error || !userResult.data.user) {
    redirect(loginHref);
  }

  return (
    <main className="min-h-screen bg-[#eef2f6] px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
        <div className="w-full max-w-[540px] rounded-2xl bg-white px-6 py-8 shadow-[0_10px_28px_rgba(20,45,99,0.08)] sm:px-8 sm:py-10">
          <h1 className="text-center text-[34px] font-extrabold leading-tight text-[#142d63]">
            Redeem Course Code
          </h1>
          <p className="mt-2 text-center text-[15px] text-slate-500">
            Enter your one-time access code to unlock your course.
          </p>

          <div className="mt-8">
            <RedeemCodeForm defaultCode={code} />
          </div>
        </div>
      </div>
    </main>
  );
}
