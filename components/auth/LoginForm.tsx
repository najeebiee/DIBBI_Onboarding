"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { usernameToInternalEmail } from "@/lib/auth/usernameToInternalEmail";
import { supabaseBrowser } from "@/lib/supabase/browser";

const INVALID_CREDENTIALS_MESSAGE =
  "Invalid username or password. Please try again.";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const email = usernameToInternalEmail(username);
      if (!username.trim() || !password) {
        setErrorMessage(INVALID_CREDENTIALS_MESSAGE);
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(INVALID_CREDENTIALS_MESSAGE);
        setIsSubmitting(false);
        return;
      }

      void keepLoggedIn;
      router.replace("/courses");
      router.refresh();
    } catch {
      setErrorMessage(INVALID_CREDENTIALS_MESSAGE);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[540px] rounded-2xl bg-white px-6 py-8 shadow-[0_10px_28px_rgba(20,45,99,0.08)] sm:px-8 sm:py-10">
      <h1 className="text-center text-[34px] font-extrabold leading-tight text-[#142d63]">
        Log Into Your Account:
      </h1>
      <p className="mt-2 text-center text-[15px] text-slate-500">
        Sign in here if you already have an account
      </p>

      <div className="mt-6 flex justify-center">
        <Image
          src="/onboarding/dibbi_logo_black.png"
          alt="DIBBI logo"
          width={280}
          height={86}
          className="h-auto w-[270px] max-w-full"
          priority
        />
      </div>

      <form className="mt-8" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-[16px] font-semibold text-[#142d63]"
          >
            Your username:
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSubmitting}
            className="h-12 w-full rounded-md border border-slate-300 bg-[#f6f8fb] px-3.5 text-[15px] text-slate-900 outline-none transition focus:border-[#142d63] focus:ring-2 focus:ring-[#142d63]/15 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="password"
            className="mb-2 block text-[16px] font-semibold text-[#142d63]"
          >
            Your password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            className="h-12 w-full rounded-md border border-slate-300 bg-[#f6f8fb] px-3.5 text-[15px] text-slate-900 outline-none transition focus:border-[#142d63] focus:ring-2 focus:ring-[#142d63]/15 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 text-[14px] sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(event) => setKeepLoggedIn(event.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-slate-300 text-[#142d63] focus:ring-[#142d63]/30"
            />
            <span>Keep me logged in</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-left font-medium text-[#0b5cff] underline-offset-2 hover:underline sm:text-right"
          >
            Forgot your password?
          </Link>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[14px] text-rose-700"
          >
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 w-full rounded-md bg-[#010a41] text-[17px] font-bold text-white transition hover:bg-[#1a255d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

