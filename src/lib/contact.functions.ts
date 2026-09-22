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

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.company) return { ok: true, emailed: false };

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
    if (error || !row) throw new Error("Could not save the message");

    let emailed = false;
    try {
      const { sendMailViaSmtp } = await import("./smtp.server");
      const sender = process.env["MIGADU_SMTP_USER"]!;
      const recipient = process.env["CONTACT_RECIPIENT_EMAIL"] || sender;
      const lines = [
        `Navn / Name: ${data.name}`,
        `E-post / Email: ${data.email}`,
        `Telefon / Phone: ${data.phone || "-"}`,
        `Språk / Language: ${data.locale}`,
        "",
        data.message,
        "",
        "---",
        "Sendt fra kontaktskjemaet på volumcalc.com",
      ];
      await sendMailViaSmtp({
        from: sender,
        fromName: "VolumCalc kontaktskjema",
        to: recipient,
        replyTo: data.email,
        subject: `[VolumCalc] ${data.subject}`,
        text: lines.join("\n"),
      });
      emailed = true;
      await supabaseAdmin.from("contact_messages").update({ email_sent: true }).eq("id", row.id);
    } catch (sendError) {
      console.error("Contact email delivery failed", sendError);
    }

    return { ok: true, emailed };
  });
