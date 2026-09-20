import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, ImagePlus, Info, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { createEstimate } from "@/lib/estimates.functions";
import { blobToDataUrl, compressImage } from "@/lib/images";

export const Route = createFileRoute("/upload")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Upload photos — VolumCalc" },
      {
        name: "description",
        content: "Upload photos of your furniture and get an itemised cubic metre estimate in seconds.",
      },
      { property: "og:title", content: "Upload photos — VolumCalc" },
      {
        property: "og:description",
        content: "Snap your rooms, get the total cubic volume of your move.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

type Stage = "idle" | "uploading" | "analysing" | "saving";

function UploadPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const submitEstimate = useServerFn(createEstimate);
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [form, setForm] = useState({ name: "", phone: "", date: "", address: "" });

  const busy = stage !== "idle";

  function addFiles(list: FileList | null) {
    if (!list) return;
    const imageFiles = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setFiles((prev) => [...prev, ...imageFiles]);
    setPreviews((prev) => [...prev, ...imageFiles.map((f) => URL.createObjectURL(f))]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!files.length) {
      toast.error(t("upload.needPhoto"));
      return;
    }

    try {
      setStage("uploading");
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      const images = await Promise.all(compressed.map((b) => blobToDataUrl(b)));

      setStage("analysing");
      const created = await submitEstimate({
        data: {
          images,
          ...(form.name.trim() ? { customer_name: form.name.trim() } : {}),
          ...(form.phone.trim() ? { customer_phone: form.phone.trim() } : {}),
          ...(form.date ? { move_date: form.date } : {}),
          ...(form.address.trim() ? { address: form.address.trim() } : {}),
        },
      });

      setStage("saving");
      navigate({ to: "/estimate/$id", params: { id: created.id }, search: { token: created.share_token } });
    } catch (error) {
      console.error(error);
      setStage("idle");
      toast.error(t("upload.failed"));
    }
  }

  const stageLabel =
    stage === "uploading"
      ? t("upload.uploading")
      : stage === "analysing"
        ? t("upload.analysing")
        : t("upload.saving");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("upload.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("upload.sub")}</p>

          <div className="mt-7 flex gap-4 rounded-xl border border-primary/20 bg-primary-soft/70 p-5">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">{t("upload.guideTitle")}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("upload.guide")}</p>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-6 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragging ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary/60"
            }`}
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ImagePlus className="size-6" />
            </div>
            <p className="mt-4 font-medium">{t("upload.drop")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("upload.hint")}</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {previews.length > 0 && (
            <>
              <p className="mt-6 text-sm text-muted-foreground">
                {previews.length} {t("upload.photos")}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <div key={src} className="group relative overflow-hidden rounded-xl border border-border">
                    <img src={src} alt="" className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 text-foreground shadow-sm"
                      aria-label="Remove photo"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="card-soft mt-10 p-6">
            <h2 className="font-semibold">{t("upload.details")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("upload.name")}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("upload.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">{t("upload.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">{t("upload.address")}</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button size="lg" className="mt-8 w-full" disabled={busy} onClick={handleSubmit}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {busy ? stageLabel : t("upload.submit")}
          </Button>

          {busy && (
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
