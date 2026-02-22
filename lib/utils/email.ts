import { Resend } from 'resend';
import { getBaseUrl } from './api-helpers';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.');
  }
  return new Resend(key);
}

const FROM_EMAIL = 'Founders Club <onboarding@resend.dev>';

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your email — Founders Club',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: #0A0A0B; color: #F5F5F5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #C9A84C; font-size: 24px; margin-bottom: 8px;">Founders Club</h1>
        <p style="color: #A0A0A0; font-size: 14px; margin-bottom: 32px;">MIT × Harvard Cofounder Matching</p>
        <p style="margin-bottom: 24px;">Click the button below to verify your email and continue your application.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #C9A84C; color: #0A0A0B; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify Email</a>
        <p style="color: #666; font-size: 12px; margin-top: 32px;">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend: ${error.message}`);
  }
  return data;
}

export async function sendApprovalEmail(email: string, name: string) {
  const baseUrl = getBaseUrl();

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to Founders Club',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: #0A0A0B; color: #F5F5F5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #C9A84C; font-size: 24px; margin-bottom: 8px;">You're in, ${name}.</h1>
        <p style="color: #A0A0A0; font-size: 14px; margin-bottom: 32px;">MIT × Harvard Cofounder Matching</p>
        <p style="margin-bottom: 24px;">Your application has been approved. You now have full access to Founders Club — browse the directory, message other founders, and check your weekly matches.</p>
        <a href="${baseUrl}/login" style="display: inline-block; background: #C9A84C; color: #0A0A0B; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Log In</a>
      </div>
    `,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendWeeklyMatchEmail(
  email: string,
  name: string,
  matches: { name: string; headline: string; school: string; id: string }[]
) {
  const baseUrl = getBaseUrl();

  const matchCards = matches
    .map(
      (m) => `
      <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.08);">
        <h3 style="color: #F5F5F5; margin: 0 0 4px 0;">${m.name}</h3>
        <p style="color: #C9A84C; font-size: 13px; margin: 0 0 8px 0;">${m.school}</p>
        <p style="color: #A0A0A0; font-size: 14px; margin: 0 0 12px 0;">${m.headline}</p>
        <a href="${baseUrl}/profile/${m.id}" style="color: #C9A84C; font-size: 13px; text-decoration: none;">View Profile &rarr;</a>
      </div>
    `
    )
    .join('');

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your weekly cofounder matches — Founders Club',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: #0A0A0B; color: #F5F5F5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #C9A84C; font-size: 24px; margin-bottom: 8px;">Your Matches This Week</h1>
        <p style="color: #A0A0A0; font-size: 14px; margin-bottom: 32px;">Hi ${name}, here are two people we think you'd work well with.</p>
        ${matchCards}
        <a href="${baseUrl}/home" style="display: inline-block; background: #C9A84C; color: #0A0A0B; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px;">View All Matches</a>
      </div>
    `,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
