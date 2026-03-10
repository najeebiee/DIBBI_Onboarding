"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { redeemCodeAction } from "@/app/redeem-code/actions";
import { initialRedeemCodeState } from "@/app/redeem-code/state";
import { normalizeAccessCode } from "@/lib/xendit/utils";

function RedeemSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 h-12 w-full rounded-md bg-[#010a41] text-[16px] font-bold text-white transition hover:bg-[#1a255d] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Redeeming code..." : "Redeem code"}
    </button>
  );
}

type RedeemCodeFormProps = {
  defaultCode?: string;
};

export default function RedeemCodeForm({ defaultCode = "" }: RedeemCodeFormProps) {
  const [state, formAction] = useActionState(redeemCodeAction, initialRedeemCodeState);
  const [code, setCode] = useState(defaultCode);

  useEffect(() => {
    setCode(defaultCode);
  }, [defaultCode]);

  return (
    <form action={formAction} noValidate>
      <label htmlFor="code" className="mb-2 block text-[16px] font-semibold text-[#142d63]">
        Enter access code:
      </label>
      <input
        id="code"
        name="code"
        type="text"
        autoComplete="off"
        placeholder="DIBBI-XXXXXX"
        value={code}
        onChange={(event) => setCode(normalizeAccessCode(event.target.value))}
        className="h-12 w-full rounded-md border border-slate-300 bg-[#f6f8fb] px-3.5 text-[15px] uppercase text-slate-900 outline-none transition focus:border-[#142d63] focus:ring-2 focus:ring-[#142d63]/15"
        required
      />

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[14px] text-rose-700"
        >
          {state.error}
        </p>
      )}

      <RedeemSubmitButton />
    </form>
  );
}
