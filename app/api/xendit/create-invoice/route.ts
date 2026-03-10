import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  buildXenditRedirectUrl,
  generateOrderExternalId,
} from "@/lib/xendit/utils";

type CreateInvoiceBody = {
  courseSlug?: string;
  buyerEmail?: string;
};

type CourseRow = {
  id: string;
  slug: string;
  title: string | null;
};

const DEFAULT_PRICE_PHP = 499;
const DEFAULT_CURRENCY = "PHP";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

async function createPendingOrder(params: {
  supabase: ReturnType<typeof createServiceRoleClient>;
  courseId: string;
  courseSlug: string;
  buyerEmail: string;
  amount: number;
  currency: string;
}) {
  const { supabase, courseId, courseSlug, buyerEmail, amount, currency } = params;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const externalId = generateOrderExternalId(courseSlug);
    const insertResult = await supabase
      .from("course_orders")
      .insert({
        course_id: courseId,
        buyer_email: buyerEmail,
        amount,
        currency,
        status: "pending",
        external_id: externalId,
      })
      .select("id, external_id")
      .single();

    if (!insertResult.error && insertResult.data) {
      return insertResult.data as { id: string; external_id: string };
    }

    if (insertResult.error?.code !== "23505") {
      throw new Error(insertResult.error?.message ?? "Unable to create order.");
    }
  }

  throw new Error("Unable to generate a unique external order id.");
}

export async function POST(request: Request) {
  let createdOrderId: string | null = null;

  try {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "Missing XENDIT_SECRET_KEY in environment." },
        { status: 500 },
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { success: false, error: "Missing NEXT_PUBLIC_APP_URL in environment." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as CreateInvoiceBody;
    const courseSlug = body.courseSlug?.trim();
    const buyerEmail = body.buyerEmail ? sanitizeEmail(body.buyerEmail) : "";

    if (!courseSlug) {
      return NextResponse.json(
        { success: false, error: "courseSlug is required." },
        { status: 400 },
      );
    }

    if (!buyerEmail || !EMAIL_REGEX.test(buyerEmail)) {
      return NextResponse.json(
        { success: false, error: "A valid buyer email is required." },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleClient();

    const courseResult = await supabase
      .from("courses")
      .select("id, slug, title")
      .eq("slug", courseSlug)
      .eq("is_published", true)
      .maybeSingle();

    if (courseResult.error) {
      return NextResponse.json(
        { success: false, error: "Failed to load course.", details: courseResult.error.message },
        { status: 500 },
      );
    }

    if (!courseResult.data) {
      return NextResponse.json(
        { success: false, error: "Course not found." },
        { status: 404 },
      );
    }

    const course = courseResult.data as CourseRow;
    const order = await createPendingOrder({
      supabase,
      courseId: course.id,
      courseSlug: course.slug,
      buyerEmail,
      amount: DEFAULT_PRICE_PHP,
      currency: DEFAULT_CURRENCY,
    });

    createdOrderId = order.id;

    const successUrl = buildXenditRedirectUrl(appUrl, "/payment/success", order.external_id);
    const failedUrl = buildXenditRedirectUrl(appUrl, "/payment/failed", order.external_id);
    const auth = Buffer.from(`${secretKey}:`).toString("base64");

    const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: order.external_id,
        amount: DEFAULT_PRICE_PHP,
        currency: DEFAULT_CURRENCY,
        description: course.title?.trim() || "DIBBI Course Purchase",
        success_redirect_url: successUrl,
        failure_redirect_url: failedUrl,
        customer: {
          email: buyerEmail,
        },
      }),
      cache: "no-store",
    });

    const xenditPayload = (await xenditResponse.json()) as {
      id?: string;
      invoice_url?: string;
      [key: string]: unknown;
    };

    if (!xenditResponse.ok || !xenditPayload.id || !xenditPayload.invoice_url) {
      await supabase
        .from("course_orders")
        .update({
          status: "failed",
          raw_payload: xenditPayload,
        })
        .eq("id", order.id);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create invoice with Xendit.",
          details: xenditPayload,
        },
        { status: 502 },
      );
    }

    const orderUpdateResult = await supabase
      .from("course_orders")
      .update({
        xendit_invoice_id: xenditPayload.id,
        invoice_url: xenditPayload.invoice_url,
        raw_payload: xenditPayload,
      })
      .eq("id", order.id);

    if (orderUpdateResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice created but local order update failed.",
          details: orderUpdateResult.error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      externalId: order.external_id,
      invoiceId: xenditPayload.id,
      invoiceUrl: xenditPayload.invoice_url,
    });
  } catch (error) {
    if (createdOrderId) {
      try {
        const supabase = createServiceRoleClient();
        await supabase
          .from("course_orders")
          .update({
            status: "failed",
            raw_payload: {
              error: error instanceof Error ? error.message : String(error),
            },
          })
          .eq("id", createdOrderId);
      } catch {
        // Ignore follow-up failure, return original error below.
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error creating invoice.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
