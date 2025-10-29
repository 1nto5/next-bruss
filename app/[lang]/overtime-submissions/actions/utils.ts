'use server';

import mailer from '@/lib/services/mailer';
import { dbc } from '@/lib/db/mongo';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Revalidate overtime submissions cache
 */
export async function revalidateOvertime() {
  revalidateTag('overtime-submissions');
}

/**
 * Revalidate individual overtime submission cache
 */
export async function revalidateOvertimeSubmission() {
  revalidateTag('overtime-submission');
}

/**
 * Redirect to overtime submissions list
 */
export async function redirectToOvertime(lang: string) {
  redirect(`/${lang}/overtime-submissions`);
}

/**
 * Redirect to specific overtime submission details
 */
export async function redirectToOvertimeSubmission(id: string, lang: string) {
  redirect(`/${lang}/overtime-submissions/${id}`);
}

/**
 * Generate next sequential internal ID for overtime submission
 * Format: "number/YY" (e.g., "123/25")
 * @internal
 */
export async function generateNextInternalId(): Promise<string> {
  try {
    const collection = await dbc('overtime_submissions');
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear.toString().slice(-2);

    // Regex to match and extract the numeric part of IDs like "123/25"
    const yearRegex = new RegExp(`^(\\d+)\\/${shortYear}$`);

    // Fetch all overtime internalIds for the current year.
    // We only need the internalId field for this operation.
    const overtimeThisYear = await collection
      .find(
        { internalId: { $regex: `\\/${shortYear}$` } }, // Filter for IDs ending with "/YY"
        { projection: { internalId: 1 } }, // Only fetch the internalId field
      )
      .toArray();

    let maxNumber = 0;
    for (const doc of overtimeThisYear) {
      if (doc.internalId) {
        const match = doc.internalId.match(yearRegex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }

    const nextNumber = maxNumber + 1;
    return `${nextNumber}/${shortYear}`;
  } catch (error) {
    console.error('Failed to generate internal ID:', error);
    // Fallback to a timestamp-based ID if there's an error.
    return `${Date.now()}/${new Date().getFullYear().toString().slice(-2)}`;
  }
}

/**
 * Send rejection notification email to employee
 * @internal
 */
export async function sendRejectionEmailToEmployee(
  email: string,
  id: string,
  rejectionReason?: string,
) {
  const subject = 'Odrzucone nadgodziny';
  const additionalText = rejectionReason
    ? `<p><strong>Powód odrzucenia:</strong> ${rejectionReason}</p>`
    : '';
  const mailOptions = {
    to: email,
    subject,
    html: `<div style="font-family: sans-serif;">
          <p>Twoje zgłoszenie nadgodzin zostało odrzucone.</p>
          ${additionalText}
          <p>
          <a href="${process.env.BASE_URL}/overtime/${id}"
             style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
            Otwórz zgłoszenie
          </a>
          </p>
        </div>`,
  };
  await mailer(mailOptions);
}

/**
 * Send approval notification email to employee
 * @param approvalType - 'supervisor' for first stage, 'final' for final approval
 * @internal
 */
export async function sendApprovalEmailToEmployee(
  email: string,
  id: string,
  approvalType: 'supervisor' | 'final' = 'final',
) {
  const subject =
    approvalType === 'supervisor'
      ? 'Nadgodziny zatwierdzone przez przełożonego'
      : 'Zatwierdzone nadgodziny';
  const message =
    approvalType === 'supervisor'
      ? '<p>Twoje zgłoszenie nadgodzin zostało zatwierdzone przez przełożonego i oczekuje na zatwierdzenie przez Plant Managera.</p>'
      : '<p>Twoje zgłoszenie nadgodzin zostało zatwierdzone!</p>';

  const mailOptions = {
    to: email,
    subject,
    html: `<div style="font-family: sans-serif;">
          ${message}
          <p>
          <a href="${process.env.BASE_URL}/overtime/${id}"
             style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #28a745; text-decoration: none; border-radius: 5px;">
            Otwórz zgłoszenie
          </a>
          </p>
        </div>`,
  };
  await mailer(mailOptions);
}
