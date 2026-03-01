import { NextResponse } from "next/server";

type CreateInvoiceBody = {
  amount?: number;
  description?: string;
  externalIdSuffix?: string;
};

function randomId(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

export async function POST(request: Request) {
  try {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing XENDIT_SECRET_KEY in environment." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as CreateInvoiceBody;
    const amount = Number(body.amount ?? 499);
    const description = body.description ?? "Onboarding Certification #1";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const suffix = body.externalIdSuffix?.trim() || randomId(6);
    const externalId = `learn247-cert1-${Date.now()}-${suffix}`;
    const successUrl = `${appUrl}/payment/success?external_id=${encodeURIComponent(externalId)}`;
    const failedUrl = `${appUrl}/payment/failed?external_id=${encodeURIComponent(externalId)}`;

    const auth = Buffer.from(`${secretKey}:`).toString("base64");
    const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        currency: "PHP",
        description,
        success_redirect_url: successUrl,
        failure_redirect_url: failedUrl,
      }),
      cache: "no-store",
    });

    const result = (await xenditResponse.json()) as {
      id?: string;
      invoice_url?: string;
      [key: string]: unknown;
    };

    if (!xenditResponse.ok || !result.id || !result.invoice_url) {
      return NextResponse.json(
        {
          error: "Failed to create invoice with Xendit.",
          details: result,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      invoiceId: result.id,
      invoiceUrl: result.invoice_url,
      externalId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected server error creating invoice.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
