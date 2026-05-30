import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Medgram <onboarding@resend.dev>";

export async function sendAccessRequestEmail({
  patientEmail,
  patientName,
  doctorName,
  doctorSpecialty,
  doctorCode,
}: {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorCode: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: patientEmail,
      subject: `Dr. ${doctorName} has requested access to your medical records`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e40af">Medgram</h2>
        <p>Hi ${patientName},</p>
        <p><strong>Dr. ${doctorName}</strong> (${doctorSpecialty}, ID: DR-${doctorCode}) has requested access to your medical records.</p>
        <p>Log in to <strong>approve or deny</strong> this request. Your records stay private until you approve.</p>
        <a href="http://localhost:3000/patient/notifications"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:500">
          Review Request
        </a>
        <p style="color:#9ca3af;font-size:12px">If you don't recognise this doctor, safely ignore this email.</p>
      </div>`,
    });
  } catch (err) {
    console.error("sendAccessRequestEmail error:", err);
  }
}

export async function sendAccessApprovedEmail({
  doctorEmail,
  doctorName,
  patientName,
  patientCode,
  expiresAt,
}: {
  doctorEmail: string;
  doctorName: string;
  patientName: string;
  patientCode: string;
  expiresAt: string;
}) {
  try {
    const expiry = new Date(expiresAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    await resend.emails.send({
      from: FROM,
      to: doctorEmail,
      subject: `Access approved — ${patientName}'s medical records`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e40af">Medgram</h2>
        <p>Hi Dr. ${doctorName},</p>
        <p><strong>${patientName}</strong> (PT-${patientCode}) approved your request.</p>
        <p>Access is valid until <strong>${expiry}</strong>.</p>
        <a href="http://localhost:3000/doctor/patients"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:500">
          View Records
        </a>
      </div>`,
    });
  } catch (err) {
    console.error("sendAccessApprovedEmail error:", err);
  }
}

export async function sendAccessDeniedEmail({
  doctorEmail,
  doctorName,
  patientName,
}: {
  doctorEmail: string;
  doctorName: string;
  patientName: string;
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: doctorEmail,
      subject: `Access request declined — ${patientName}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e40af">Medgram</h2>
        <p>Hi Dr. ${doctorName},</p>
        <p><strong>${patientName}</strong> has declined your request to access their records.</p>
      </div>`,
    });
  } catch (err) {
    console.error("sendAccessDeniedEmail error:", err);
  }
}
