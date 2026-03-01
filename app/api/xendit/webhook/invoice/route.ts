import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Xendit invoice webhook payload:", payload);

    // TODO: Verify webhook signature/token (if enabled in Xendit dashboard).
    // TODO: Update DB order status to PAID/EXPIRED based on payload.status.
    // TODO: Unlock onboarding/course access after successful payment.

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook parse error:", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
