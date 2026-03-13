import { NextResponse } from "next/server";
import { sendCourseAccessCodeEmail } from "@/lib/email/sendCourseAccessCodeEmail";
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
  raw_payload: unknown;
};

async function findOrder(payload: InvoiceWebhookPayload): Promise<CourseOrderRow | null> {
  const supabase = createServiceRoleClient();

  if (payload.id) {
    const byInvoice = await supabase
      .from("course_orders")
      .select("id, course_id, buyer_email, status, raw_payload")
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
      .select("id, course_id, buyer_email, status, raw_payload")
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

type AccessEmailMeta = {
  access_code_email?: {
    sent_at?: string;
    email_id?: string;
    recipient?: string;
  };
};

function getAccessEmailMeta(rawPayload: unknown): AccessEmailMeta["access_code_email"] | null {
  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    return null;
  }

  const meta = (rawPayload as AccessEmailMeta).access_code_email;
  return meta && typeof meta === "object" ? meta : null;
}

function mergeRawPayload(
  payload: InvoiceWebhookPayload,
  existingRawPayload: unknown,
  accessCodeEmail?: NonNullable<AccessEmailMeta["access_code_email"]>,
) {
  const existingObject =
    existingRawPayload && typeof existingRawPayload === "object" && !Array.isArray(existingRawPayload)
      ? (existingRawPayload as Record<string, unknown>)
      : {};

  const nextPayload: Record<string, unknown> = {
    ...existingObject,
    ...payload,
  };

  const previousEmailMeta = getAccessEmailMeta(existingRawPayload);
  if (previousEmailMeta || accessCodeEmail) {
    nextPayload.access_code_email = {
      ...(previousEmailMeta ?? {}),
      ...(accessCodeEmail ?? {}),
    };
  }

  return nextPayload;
}

async function loadCourseEmailDetails(courseId: string) {
  const supabase = createServiceRoleClient();
  const result = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return {
    title: result.data?.title?.trim() || "DIBBI Course",
  };
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

    orderUpdate.raw_payload = mergeRawPayload(payload, order.raw_payload);

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
      const accessCode = await ensureAccessCodeForOrder(order);
      const existingEmailMeta = getAccessEmailMeta(order.raw_payload);

      if (accessCode && !existingEmailMeta?.sent_at) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl) {
          console.error("Access code email skipped: missing NEXT_PUBLIC_APP_URL.");
        } else {
          try {
            const course = await loadCourseEmailDetails(order.course_id);
            const emailResult = await sendCourseAccessCodeEmail({
              appUrl,
              buyerEmail: order.buyer_email,
              courseName: course.title,
              accessCode,
              orderId: order.id,
            });

            const emailPayload = mergeRawPayload(payload, order.raw_payload, {
              sent_at: new Date().toISOString(),
              email_id: emailResult.emailId,
              recipient: order.buyer_email,
            });

            const emailUpdate = await supabase
              .from("course_orders")
              .update({ raw_payload: emailPayload })
              .eq("id", order.id);

            if (emailUpdate.error) {
              console.error("Access code email sent but order metadata update failed", {
                orderId: order.id,
                error: emailUpdate.error.message,
              });
            }
          } catch (error) {
            console.error("Access code email send failed", {
              orderId: order.id,
              buyerEmail: order.buyer_email,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
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
