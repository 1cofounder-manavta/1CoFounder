import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function sendEmail(to, subject, html) {
  if (!resend) { console.log(`[EMAIL SKIP] No Resend key. To: ${to}, Subject: ${subject}`); return false; }
  try {
    const result = await resend.emails.send({ from: SENDER_EMAIL, to: [to], subject, html });
    if (result.error) {
      console.error(`[EMAIL ERROR] ${result.error.message}`);
      return false;
    }
    console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
    return true;
  } catch (e) { console.error(`[EMAIL ERROR] ${e.message}`); return false; }
}

export function emailTemplate(title, body) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc;"><div style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;"><div style="text-align:center;margin-bottom:24px;"><span style="font-size:20px;font-weight:700;color:#0f766e;">1CoFounder</span><p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">A Manavta Foundation Initiative</p></div><h2 style="font-size:18px;color:#1e293b;margin-bottom:12px;">${title}</h2><div style="color:#475569;font-size:14px;line-height:1.7;">${body}</div><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/><p style="color:#94a3b8;font-size:11px;text-align:center;">1CoFounder.com — Find your healthcare co-founder</p></div></div>`;
}
