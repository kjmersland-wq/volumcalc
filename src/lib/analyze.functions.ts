import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  images: z.array(z.string().min(20)).min(1).max(15),
});

export type { DetectedItem } from "./analyze.server";

export const analyzePhotos = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { analyzeImages } = await import("./analyze.server");
    return analyzeImages(data.images);
  });
