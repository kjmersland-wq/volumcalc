import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { FAQ } from "@/lib/faq-content";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.en.groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
};

export const Route = createFileRoute("/hjelp")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Hjelp og FAQ / Help and FAQ — VolumCalc" },
      {
        name: "description",
        content:
          "Answers to the most common questions about VolumCalc: checklist, volume, vehicle, PDF, sharing, pricing and privacy.",
      },
      { property: "og:title", content: "Hjelp og FAQ — VolumCalc" },
      { property: "og:description", content: "Alt du lurer på om volumberegning med VolumCalc." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.volumcalc.com/hjelp" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqSchema) }],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { lang } = useI18n();
  const c = FAQ[lang] ?? FAQ.en;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{c.intro}</p>

          <div className="mt-12 space-y-10">
            {c.groups.map((group) => (
              <section key={group.heading}>
                <h2 className="text-xl font-semibold">{group.heading}</h2>
                <div className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.q} className="card-soft p-5">
                      <h3 className="font-semibold">{item.q}</h3>
                      <p className="mt-2 leading-relaxed text-muted-foreground">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="card-soft mt-12 p-6">
            <h2 className="text-lg font-semibold">{c.ctaTitle}</h2>
            <p className="mt-2 text-muted-foreground">{c.ctaText}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/upload">{c.cta}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">{c.contact}</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
