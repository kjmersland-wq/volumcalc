export type DetectedItem = {
  name: string;
  name_no: string;
  category: string;
  quantity: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  volume_m3: number;
  confidence: number;
  photo_index: number;
  room: string;
};

const ROOM_NAMES = [
  "Living room", "Kitchen", "Bedroom 1", "Bedroom 2", "Bedroom 3", "Bathroom room",
  "Garage", "Hallway", "Bathroom", "Office", "Dining room", "Other",
] as const;

const SYSTEM_PROMPT = `You are a professional moving surveyor estimating cubic volume (m³) from customer photos.

Rules:
- Identify every distinct piece of furniture, appliance, box and bulky household item visible in the photos.
- Do NOT list small decorations, cables, food, plants under 40 cm, or built-in fixtures (kitchen cabinets, radiators, doors).
- Merge duplicates of the same item type into one row with a quantity.
- For every item give realistic packed dimensions in centimetres based on standard furniture sizes adjusted to what you see.
- volume_m3 = length_cm * width_cm * height_cm / 1000000, multiplied by quantity, rounded to 2 decimals.
- confidence is 0.0-1.0, reflecting how certain you are about the identification and size.
- name is English, name_no is the Norwegian translation.
- photo_index is the zero-based index of the photo where the item is most clearly visible.
- room must be exactly one of: ${ROOM_NAMES.join(", ")}. Infer which photos show the same room and group their items together. Use numbered bedroom names in discovery order. Use Other only when no suggested room fits.

Answer with ONLY a JSON object of the shape:
{"items":[{"name":"","name_no":"","category":"","quantity":1,"length_cm":0,"width_cm":0,"height_cm":0,"volume_m3":0,"confidence":0.8,"photo_index":0,"room":"Living room"}]}`;

function parseItems(raw: string): DetectedItem[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return [];
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as { items?: unknown };
  if (!Array.isArray(parsed.items)) return [];

  return parsed.items
    .map((entry) => {
      const item = entry as Record<string, unknown>;
      const qty = Math.max(1, Math.round(Number(item['quantity']) || 1));
      const l = Math.max(0, Number(item['length_cm']) || 0);
      const w = Math.max(0, Number(item['width_cm']) || 0);
      const h = Math.max(0, Number(item['height_cm']) || 0);
      const computed = (l * w * h * qty) / 1_000_000;
      const given = Number(item['volume_m3']) || 0;
      const volume = given > 0 && Math.abs(given - computed) / Math.max(computed, 0.01) < 0.5 ? given : computed;
      return {
        name: String(item['name'] ?? "Item").slice(0, 120),
        name_no: String(item['name_no'] ?? item['name'] ?? "Gjenstand").slice(0, 120),
        category: String(item['category'] ?? "other").slice(0, 80),
        quantity: qty,
        length_cm: l,
        width_cm: w,
        height_cm: h,
        volume_m3: Math.round(volume * 100) / 100,
        confidence: Math.min(1, Math.max(0, Number(item['confidence']) || 0.7)),
        photo_index: Math.max(0, Math.round(Number(item['photo_index']) || 0)),
        room: ROOM_NAMES.includes(String(item['room']) as (typeof ROOM_NAMES)[number])
          ? String(item['room'])
          : "Other",
      } satisfies DetectedItem;
    })
    .filter((item) => item.volume_m3 > 0);
}

export async function analyzeImages(images: string[]): Promise<{ items: DetectedItem[]; total: number }> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      reasoning: { effort: "low" },
      input: [
        { role: "developer", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyse these ${images.length} photo(s) and return the itemised cubic volume list as JSON.`,
            },
            ...images.map((url) => ({ type: "input_image", image_url: url })),
          ],
        },
      ],
    }),
  });

  if (response.status === 429) throw new Error("rate_limited");
  if (response.status === 402) throw new Error("payment_required");
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
    const safeMessage = payload?.message ?? payload?.error?.message ?? "AI analysis failed";
    console.error("AI gateway error", response.status, safeMessage);
    throw new Error("AI analysis failed");
  }

  const payload = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const content = payload.output_text ?? payload.output?.flatMap((entry) => entry.content ?? [])
    .find((entry) => entry.type === "output_text")?.text ?? "";
  const items = parseItems(content);
  const total = Math.round(items.reduce((sum, i) => sum + i.volume_m3, 0) * 100) / 100;

  return { items, total };
}
