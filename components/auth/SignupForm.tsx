"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizeUsernameForAuth } from "@/lib/auth/usernameToInternalEmail";

type SignupResponse = {
  success: boolean;
  error?: string;
};

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const code = searchParams.get("code")?.trim() ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedUsername = normalizeUsernameForAuth(username);
    if (!normalizedUsername) {
      setErrorMessage("Username is required.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normalizedUsername,
          password,
          fullName,
        }),
      });

      const payload = (await response.json()) as SignupResponse;
      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error ?? "Unable to create account.");
        setIsSubmitting(false);
        return;
      }

      const loginParams = new URLSearchParams({ signup: "success" });
      if (code) {
        loginParams.set("code", code);
      }

      router.replace(`/login?${loginParams.toString()}`);
      router.refresh();
    } catch {
      setErrorMessage("Unexpected error creating account.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[540px] rounded-2xl bg-white px-6 py-8 shadow-[0_10px_28px_rgba(20,45,99,0.08)] sm:px-8 sm:py-10">
      <h1 className="text-center text-[34px] font-extrabold leading-tight text-[#142d63]">
        Create Your Account
      </h1>
      <p className="mt-2 text-center text-[15px] text-slate-500">
        Sign up with a username and password
      </p>

      <form className="mt-8" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="fullName" className="mb-2 block text-[16px] font-semibold text-[#142d63]">
            Full name (optional):
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={isSubmitting}
            className="h-12 w-full rounded-md border border-slate-300 bg-[#f6f8fb] px-3.5 text-[15px] text-slate-900 outline-none transition focus:border-[#142d63] focus:ring-2 focus:ring-[#142d63]/15 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="mt-5">
          <label htmlFor="username" className="mb-2 block text-[16px] font-semibold text-[#142d63]">
            Username:
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Choose your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSubmitting}
            className="h-12 w-full rounded-md border border-slate-300 bg-[#f6f8fb] px-3.5 text-[15px] text-slate-900 outline-none transition focus:border-[#142d63] focus:ring-2 focus:ring-[#142d63]/15 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </div>

        <div className="mt-5">
          <label htmlFor="password" className="mb-2 block text-[16px] font-semibold text-[#142d63]">
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            className="h-12 w-full rounded-md border border-slate-300 bg-[#f6f8fb] px-3.5 text-[15px] text-slate-900 outline-none transition focus:border-[#142d63] focus:ring-2 focus:ring-[#142d63]/15 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </div>

        <div className="mt-5">
          <label htmlFor="confirmPassword" className="mb-2 block text-[16px] font-semibold text-[#142d63]">
            Confirm password:
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSubmitting}
            className="h-12 w-full rounded-md border border-slate-300 bg-[#f6f8fb] px-3.5 text-[15px] text-slate-900 outline-none transition focus:border-[#142d63] focus:ring-2 focus:ring-[#142d63]/15 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
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
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={code ? `/login?code=${encodeURIComponent(code)}` : "/login"}
            className="font-semibold text-[#0b5cff] underline-offset-2 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
