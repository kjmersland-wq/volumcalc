import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm, ContactDetails } from "@/components/ContactForm";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contact VolumCalc — talk to us about volume estimates" },
      {
        name: "description",
        content:
          "Get in touch with the VolumCalc team about AI volume estimates, pricing for movers, demos or support. We reply within one business day.",
      },
      { property: "og:title", content: "Contact VolumCalc" },
      {
        property: "og:description",
        content: "Questions about AI volume estimates, pricing or a demo? Send us a message.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {t("contact.badge")}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t("contact.title")}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("contact.sub")}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.6fr_1fr] lg:py-16">
          <ContactForm />
          <div className="space-y-6">
            <ContactDetails />
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              {t("contact.aside")}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
