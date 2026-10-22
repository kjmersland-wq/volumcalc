import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(2).max(160).regex(/^[^\r\n]*$/, "Subject cannot contain line breaks"),
  message: z.string().trim().min(10).max(4000),
  locale: z.enum(["no", "en"]).default("no"),
  company: z.string().max(0).optional(), // honeypot
});

/**
 * Every contact message is e-mailed to the site owner. Saving it in the database is a bonus: if
 * the database is unreachable the message is still delivered, and it only fails when both fail.
 */
export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.company) return { ok: true, emailed: false };

    const recipient = process.env["CONTACT_RECIPIENT_EMAIL"] || "kjmersland@gmail.com";

    let rowId: string | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin
        .from("contact_messages")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          locale: data.locale,
        })
        .select("id")
        .single();
      if (error) throw error;
      rowId = row.id;
    } catch (saveError) {
      console.error("Could not save the contact message", saveError);
    }

    let emailed = false;
    try {
      const { sendMailViaSmtp } = await import("@/lib/smtp.server");
      await sendMailViaSmtp({
        from: process.env["MIGADU_SMTP_USER"] ?? "",
        fromName: `${data.name} via VolumCalc`,
        to: recipient,
        replyTo: data.email,
        subject: `[VolumCalc kontakt] ${data.subject}`,
        text: [
          `Navn: ${data.name}`,
          `E-post: ${data.email}`,
          data.phone ? `Telefon: ${data.phone}` : null,
          `Språk: ${data.locale}`,
          "",
          data.message,
        ]
          .filter((line): line is string => line !== null)
          .join("\n"),
      });
      emailed = true;
      if (rowId) {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.from("contact_messages").update({ email_sent: true }).eq("id", rowId);
        } catch {
          /* flag only; the message is already delivered */
        }
      }
    } catch (sendError) {
      console.error("Contact email delivery failed", sendError);
    }

    if (!emailed && !rowId) throw new Error("Could not send the message");
    return { ok: true, emailed };
  });
