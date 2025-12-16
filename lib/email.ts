import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.log("⚠️ No RESEND_API_KEY found. Mocking email send.");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        return { success: true };
    }

    try {
        const data = await resend.emails.send({
            from: 'Pickleball Players <onboarding@resend.dev>', // Update this with your verified domain
            to: [to],
            subject: subject,
            html: html,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Email Error:", error);
        return { success: false, error };
    }
}
