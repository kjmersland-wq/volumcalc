import { createServerFn } from "@tanstack/react-start";
import { requireOwner } from "@/lib/owner-middleware";
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
  .middleware([requireOwner])
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
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const result = await sendTemplateEmail("contact-notification", "kjmersland@gmail.com", {
        templateData: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          locale: data.locale,
        },
        idempotencyKey: `contact-notification-${row.id}`,
        replyTo: data.email,
      });
      if (!result.sent) throw new Error("Recipient suppressed");
      emailed = true;
      await supabaseAdmin.from("contact_messages").update({ email_sent: true }).eq("id", row.id);
    } catch (sendError) {
      console.error("Contact email delivery failed", sendError);
    }

    return { ok: true, emailed };
  });
