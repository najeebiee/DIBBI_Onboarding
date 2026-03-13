type SendCourseAccessCodeEmailParams = {
  appUrl: string;
  buyerEmail: string;
  courseName: string;
  accessCode: string;
  orderId: string;
};

type SendCourseAccessCodeEmailResult = {
  emailId: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildRedeemUrl(appUrl: string, accessCode: string): string {
  const normalizedAppUrl = appUrl.replace(/\/+$/, "");
  return `${normalizedAppUrl}/redeem-code?code=${encodeURIComponent(accessCode)}`;
}

function buildEmailHtml(params: {
  buyerEmail: string;
  courseName: string;
  accessCode: string;
  redeemUrl: string;
}) {
  const buyerEmail = escapeHtml(params.buyerEmail);
  const courseName = escapeHtml(params.courseName);
  const accessCode = escapeHtml(params.accessCode);
  const redeemUrl = escapeHtml(params.redeemUrl);

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="font-size:24px;margin:0 0 16px;">Your DIBBI course access code</h1>
      <p style="margin:0 0 16px;">Your payment was confirmed for <strong>${courseName}</strong>.</p>
      <div style="margin:24px 0;padding:20px;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#15803d;">
          Access code
        </p>
        <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:.12em;color:#14532d;">${accessCode}</p>
      </div>
      <p style="margin:0 0 8px;"><strong>How to redeem:</strong></p>
      <ol style="margin:0 0 20px;padding-left:20px;">
        <li>Log in or create your DIBBI account using <strong>${buyerEmail}</strong> as your buyer email reference.</li>
        <li>Open the redeem page.</li>
        <li>Enter the access code above to unlock your course.</li>
      </ol>
      <p style="margin:0 0 20px;">
        <a href="${redeemUrl}" style="display:inline-block;padding:12px 18px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
          Redeem your course
        </a>
      </p>
      <p style="margin:0;color:#475569;">If the button does not work, open this link:</p>
      <p style="margin:8px 0 0;word-break:break-all;"><a href="${redeemUrl}">${redeemUrl}</a></p>
    </div>
  `.trim();
}

function buildEmailText(params: {
  courseName: string;
  accessCode: string;
  redeemUrl: string;
}) {
  return [
    `Your payment was confirmed for ${params.courseName}.`,
    "",
    `Access code: ${params.accessCode}`,
    "",
    "How to redeem:",
    "1. Log in or create your DIBBI account.",
    "2. Open the redeem page below.",
    "3. Enter your access code to unlock the course.",
    "",
    `Redeem link: ${params.redeemUrl}`,
  ].join("\n");
}

export async function sendCourseAccessCodeEmail(
  params: SendCourseAccessCodeEmailParams,
): Promise<SendCourseAccessCodeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY in environment.");
  }

  if (!fromEmail) {
    throw new Error("Missing RESEND_FROM_EMAIL in environment.");
  }

  const redeemUrl = buildRedeemUrl(params.appUrl, params.accessCode);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `course-access-${params.orderId}-${params.accessCode}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [params.buyerEmail],
      subject: `Your DIBBI access code for ${params.courseName}`,
      html: buildEmailHtml({
        buyerEmail: params.buyerEmail,
        courseName: params.courseName,
        accessCode: params.accessCode,
        redeemUrl,
      }),
      text: buildEmailText({
        courseName: params.courseName,
        accessCode: params.accessCode,
        redeemUrl,
      }),
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!response.ok || !payload.id) {
    throw new Error(payload.message ?? payload.name ?? "Failed to send access code email.");
  }

  return { emailId: payload.id };
}
