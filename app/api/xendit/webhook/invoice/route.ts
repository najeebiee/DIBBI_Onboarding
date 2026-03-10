import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { generateCourseAccessCode, normalizeOrderStatus } from "@/lib/xendit/utils";

type InvoiceWebhookPayload = {
  id?: string;
  external_id?: string;
  status?: string;
  payment_method?: string;
  paid_at?: string;
  [key: string]: unknown;
};

type CourseOrderRow = {
  id: string;
  course_id: string;
  buyer_email: string;
  status: string;
};

async function findOrder(payload: InvoiceWebhookPayload): Promise<CourseOrderRow | null> {
  const supabase = createServiceRoleClient();

  if (payload.id) {
    const byInvoice = await supabase
      .from("course_orders")
      .select("id, course_id, buyer_email, status")
      .eq("xendit_invoice_id", payload.id)
      .maybeSingle();

    if (byInvoice.error) {
      throw new Error(byInvoice.error.message);
    }

    if (byInvoice.data) {
      return byInvoice.data as CourseOrderRow;
    }
  }

  if (payload.external_id) {
    const byExternal = await supabase
      .from("course_orders")
      .select("id, course_id, buyer_email, status")
      .eq("external_id", payload.external_id)
      .maybeSingle();

    if (byExternal.error) {
      throw new Error(byExternal.error.message);
    }

    if (byExternal.data) {
      return byExternal.data as CourseOrderRow;
    }
  }

  return null;
}

async function ensureAccessCodeForOrder(order: CourseOrderRow): Promise<string | null> {
  const supabase = createServiceRoleClient();

  const existing = await supabase
    .from("course_access_codes")
    .select("code")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data?.code) {
    return existing.data.code as string;
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidateCode = generateCourseAccessCode(6);

    const insert = await supabase
      .from("course_access_codes")
      .insert({
        course_id: order.course_id,
        order_id: order.id,
        buyer_email: order.buyer_email,
        code: candidateCode,
        is_used: false,
      })
      .select("code")
      .single();

    if (!insert.error && insert.data?.code) {
      return insert.data.code as string;
    }

    if (insert.error?.code === "23505") {
      const concurrent = await supabase
        .from("course_access_codes")
        .select("code")
        .eq("order_id", order.id)
        .maybeSingle();

      if (concurrent.error) {
        throw new Error(concurrent.error.message);
      }

      if (concurrent.data?.code) {
        return concurrent.data.code as string;
      }

      continue;
    }

    throw new Error(insert.error?.message ?? "Unable to generate access code.");
  }

  throw new Error("Unable to generate a unique access code.");
}

export async function POST(request: Request) {
  try {
    const verificationToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
    if (!verificationToken) {
      return NextResponse.json(
        { ok: false, error: "Missing XENDIT_WEBHOOK_VERIFICATION_TOKEN in environment." },
        { status: 500 },
      );
    }

    const callbackToken = request.headers.get("x-callback-token")?.trim();
    if (!callbackToken || callbackToken !== verificationToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized webhook." }, { status: 401 });
    }

    const payload = (await request.json()) as InvoiceWebhookPayload;
    const normalizedStatus = normalizeOrderStatus(payload.status);
    const order = await findOrder(payload);

    if (!order) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Order not found." });
    }

    const supabase = createServiceRoleClient();

    const finalStatus =
      order.status === "paid" && normalizedStatus !== "paid"
        ? "paid"
        : normalizedStatus;

    const orderUpdate: Record<string, unknown> = {
      status: finalStatus,
      raw_payload: payload,
      payment_method:
        typeof payload.payment_method === "string" && payload.payment_method.trim()
          ? payload.payment_method
          : null,
    };

    if (payload.id) {
      orderUpdate.xendit_invoice_id = payload.id;
    }

    if (finalStatus === "paid") {
      orderUpdate.paid_at =
        typeof payload.paid_at === "string" && payload.paid_at.trim()
          ? payload.paid_at
          : new Date().toISOString();
    }

    const updateResult = await supabase
      .from("course_orders")
      .update(orderUpdate)
      .eq("id", order.id);

    if (updateResult.error) {
      return NextResponse.json(
        { ok: false, error: "Failed to update order.", details: updateResult.error.message },
        { status: 500 },
      );
    }

    if (finalStatus === "paid") {
      await ensureAccessCodeForOrder(order);
    }

    return NextResponse.json({ ok: true, status: finalStatus });
  } catch (error) {
    console.error("Xendit invoice webhook error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to process webhook.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
