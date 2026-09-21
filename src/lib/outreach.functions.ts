import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  estimateId: z.string().uuid(),
  token: z.string().min(6).max(80),
  recipients: z.array(z.string().trim().email().max(180)).min(1).max(15),
  replyTo: z.string().trim().email().max(180),
  senderName: z.string().trim().min(2).max(120),
  message: z.string().trim().max(2000).optional(),
  reportUrl: z.string().trim().url().max(500),
});

/**
 * Sends the shareable estimate report link to the moving companies the
 * customer picked. The share token is validated against the estimate so a
 * report can only be sent by someone who already holds the link.
 */
export const sendEstimateToMovers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: estimate } = await supabaseAdmin
      .from("estimates")
      .select("id, share_token, total_volume_m3, report_title, customer_name")
      .eq("id", data.estimateId)
      .maybeSingle();
    if (!estimate || estimate.share_token !== data.token) throw new Error("Invalid report link");

    const title = estimate.report_title || estimate.customer_name || "Flytteoppdrag";
    const lines = [
      `Forespørsel om pristilbud / Request for quote: ${title}`,
      `Estimert volum / Estimated volume: ${estimate.total_volume_m3} m³`,
      "",
      data.message?.trim() || "",
      "",
      `Full rapport / Full report: ${data.reportUrl}`,
      "",
      `Avsender / Sender: ${data.senderName} (${data.replyTo})`,
      "Sendt via VolumCalc – volumcalc.com",
    ];

    const { sendMailViaSmtp } = await import("./smtp.server");
    const sender = process.env["MIGADU_SMTP_USER"]!;
    const results: { to: string; ok: boolean }[] = [];
    for (const to of data.recipients) {
      try {
        await sendMailViaSmtp({
          from: sender,
          fromName: "VolumCalc",
          to,
          replyTo: data.replyTo,
          subject: `[VolumCalc] Forespørsel om pristilbud – ${title}`,
          text: lines.join("\n"),
        });
        results.push({ to, ok: true });
      } catch (error) {
        console.error("Mover outreach failed", to, error);
        results.push({ to, ok: false });
      }
    }
    return { sent: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).map((r) => r.to) };
  });
