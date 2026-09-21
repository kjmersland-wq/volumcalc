import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, UserRound, Building2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Pricing for individuals and movers — VolumCalc" },
      {
        name: "description",
        content:
          "Plans for movers and storage providers, from a free starter tier to unlimited estimates.",
      },
      { property: "og:title", content: "Pricing for individuals and movers — VolumCalc" },
      {
        property: "og:description",
        content:
          "Simple monthly plans for video-based cubic volume estimates and checklist workflows.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { t, lang } = useI18n();
  const [checkout, setCheckout] = useState<{ priceId: string; name: string } | null>(null);

  const pricingCopy = {
    businessDesc:
      {
        no: "300 beregninger per måned",
        en: "300 estimates per month",
        sv: "300 beräkningar per månad",
        da: "300 beregninger pr. måned",
        fi: "300 arviota kuukaudessa",
        de: "300 Schätzungen pro Monat",
        nl: "300 schattingen per maand",
        fr: "300 estimations par mois",
        pl: "300 wycen miesięcznie",
        es: "300 estimaciones al mes",
        it: "300 stime al mese",
        pt: "300 estimativas por mês",
      }[lang] ?? "300 estimates per month",
    businessFeatures: {
      no: ["Alle basisfunksjoner", "Egen logo og farger", "Pris per m³ og tilbud", "PDF-rapport"],
      en: ["All core features", "Your logo and colours", "Rate per m³ and quotes", "PDF report"],
      sv: [
        "Alla kärnfunktioner",
        "Egen logotyp och egna färger",
        "Pris per m³ och offerter",
        "PDF-rapport",
      ],
      da: [
        "Alle kernefunktioner",
        "Eget logo og egne farver",
        "Pris pr. m³ og tilbud",
        "PDF-rapport",
      ],
      fi: [
        "Kaikki perusominaisuudet",
        "Oma logo ja omat värit",
        "Hinta per m³ ja tarjoukset",
        "PDF-raportti",
      ],
      de: [
        "Alle Kernfunktionen",
        "Eigenes Logo und eigene Farben",
        "Preis pro m³ und Angebote",
        "PDF-Bericht",
      ],
      nl: [
        "Alle basisfuncties",
        "Je eigen logo en kleuren",
        "Prijs per m³ en offertes",
        "PDF-rapport",
      ],
      fr: [
        "Toutes les fonctions essentielles",
        "Votre logo et vos couleurs",
        "Tarif au m³ et devis",
        "Rapport PDF",
      ],
      pl: [
        "Wszystkie funkcje podstawowe",
        "Własne logo i kolory",
        "Cena za m³ i oferty",
        "Raport PDF",
      ],
      es: [
        "Todas las funciones principales",
        "Tu logotipo y tus colores",
        "Tarifa por m³ y presupuestos",
        "Informe PDF",
      ],
      it: [
        "Tutte le funzioni essenziali",
        "Logo e colori del tuo marchio",
        "Tariffa per m³ e preventivi",
        "Report PDF",
      ],
      pt: [
        "Todas as funcionalidades essenciais",
        "O seu logótipo e as suas cores",
        "Preço por m³ e orçamentos",
        "Relatório PDF",
      ],
    }[lang] ?? [
      "All core features",
      "Your logo and colours",
      "Rate per m³ and quotes",
      "PDF report",
    ],
    enterprisePrice:
      {
        no: "Kontakt oss",
        en: "Talk to us",
        sv: "Prata med oss",
        da: "Tal med os",
        fi: "Ota yhteyttä",
        de: "Sprechen Sie mit uns",
        nl: "Neem contact op",
        fr: "Parlons-en",
        pl: "Porozmawiaj z nami",
        es: "Hablemos",
        it: "Parliamone",
        pt: "Fale connosco",
      }[lang] ?? "Talk to us",
    enterpriseDesc:
      {
        no: "Ubegrenset volum",
        en: "Unlimited volume",
        sv: "Obegränsad volym",
        da: "Ubegrænset volumen",
        fi: "Rajaton määrä arvioita",
        de: "Unbegrenztes Volumen",
        nl: "Onbeperkt volume",
        fr: "Volume illimité",
        pl: "Nielimitowana liczba wycen",
        es: "Volumen ilimitado",
        it: "Volume illimitato",
        pt: "Volume ilimitado",
      }[lang] ?? "Unlimited volume",
    enterpriseFeatures: {
      no: ["Alt i Business", "Flere avdelinger", "API og integrasjoner", "Egen kundekontakt"],
      en: [
        "Everything in Business",
        "Multiple branches",
        "API and integrations",
        "Dedicated contact",
      ],
      sv: ["Allt i Business", "Flera kontor", "API och integrationer", "Egen kontaktperson"],
      da: ["Alt i Business", "Flere afdelinger", "API og integrationer", "Fast kontaktperson"],
      fi: [
        "Kaikki Business-paketista",
        "Useita toimipisteitä",
        "API ja integraatiot",
        "Oma yhteyshenkilö",
      ],
      de: [
        "Alles aus Business",
        "Mehrere Standorte",
        "API und Integrationen",
        "Persönliche Ansprechperson",
      ],
      nl: [
        "Alles uit Business",
        "Meerdere vestigingen",
        "API en integraties",
        "Vaste contactpersoon",
      ],
      fr: [
        "Tout le contenu de Business",
        "Plusieurs agences",
        "API et intégrations",
        "Interlocuteur dédié",
      ],
      pl: [
        "Wszystko z pakietu Business",
        "Wiele oddziałów",
        "API i integracje",
        "Dedykowany opiekun",
      ],
      es: [
        "Todo lo de Business",
        "Varias sucursales",
        "API e integraciones",
        "Persona de contacto dedicada",
      ],
      it: [
        "Tutto ciò che è incluso in Business",
        "Più sedi",
        "API e integrazioni",
        "Referente dedicato",
      ],
      pt: [
        "Tudo o que está no Business",
        "Várias filiais",
        "API e integrações",
        "Contacto dedicado",
      ],
    }[lang] ?? [
      "Everything in Business",
      "Multiple branches",
      "API and integrations",
      "Dedicated contact",
    ],
    singleName:
      {
        no: "Én beregning",
        en: "Single estimate",
        sv: "1 beräkning",
        da: "1 beregning",
        fi: "1 arvio",
        de: "1 Schätzung",
        nl: "1 schatting",
        fr: "1 estimation",
        pl: "1 wycena",
        es: "1 estimación",
        it: "1 stima",
        pt: "1 estimativa",
      }[lang] ?? "Single estimate",
    singleDesc:
      {
        no: "For én flytting",
        en: "For one move",
        sv: "För en flytt",
        da: "Til én flytning",
        fi: "Yhtä muuttoa varten",
        de: "Für einen Umzug",
        nl: "Voor één verhuizing",
        fr: "Pour un déménagement",
        pl: "Na jedną przeprowadzkę",
        es: "Para una mudanza",
        it: "Per un trasloco",
        pt: "Para uma mudança",
      }[lang] ?? "For one move",
    singleFeatures: {
      no: ["Romvideo + sjekkliste", "Romvis sortering", "PDF-rapport"],
      en: ["Room video + checklist", "Room grouping", "PDF report"],
      sv: ["Rumsvideo + checklista", "Sortering per rum", "PDF-rapport"],
      da: ["Rumvideo + tjekliste", "Sortering pr. rum", "PDF-rapport"],
      fi: ["Huonevideo + tarkistuslista", "Ryhmittely huoneittain", "PDF-raportti"],
      de: ["Raumvideo + Checkliste", "Sortierung nach Räumen", "PDF-Bericht"],
      nl: ["Kamervideo + checklist", "Groepering per kamer", "PDF-rapport"],
      fr: ["Vidéo de pièce + checklist", "Classement par pièce", "Rapport PDF"],
      pl: ["Nagranie pokoju + lista kontrolna", "Podział na pokoje", "Raport PDF"],
      es: ["Vídeo de la estancia + lista", "Agrupación por estancia", "Informe PDF"],
      it: ["Video della stanza + checklist", "Raggruppamento per stanza", "Report PDF"],
      pt: ["Vídeo da divisão + checklist", "Agrupamento por divisão", "Relatório PDF"],
    }[lang] ?? ["Room video + checklist", "Room grouping", "PDF report"],
    bundleName:
      {
        no: "3 beregninger",
        en: "3 estimates",
        sv: "3 beräkningar",
        da: "3 beregninger",
        fi: "3 arviota",
        de: "3 Schätzungen",
        nl: "3 schattingen",
        fr: "3 estimations",
        pl: "3 wyceny",
        es: "3 estimaciones",
        it: "3 stime",
        pt: "3 estimativas",
      }[lang] ?? "3 estimates",
    bundleDesc:
      {
        no: "Spar 88 NOK",
        en: "Save 88 NOK",
        sv: "Spara 88 NOK",
        da: "Spar 88 NOK",
        fi: "Säästä 88 NOK",
        de: "88 NOK sparen",
        nl: "Bespaar 88 NOK",
        fr: "Économisez 88 NOK",
        pl: "Oszczędź 88 NOK",
        es: "Ahorra 88 NOK",
        it: "Risparmia 88 NOK",
        pt: "Poupe 88 NOK",
      }[lang] ?? "Save 88 NOK",
    bundleFeatures: {
      no: ["3 komplette beregninger", "Romvideo + sjekkliste", "PDF-rapporter"],
      en: ["3 complete estimates", "Room video + checklist", "PDF reports"],
      sv: ["3 kompletta beräkningar", "Rumsvideo + checklista", "PDF-rapporter"],
      da: ["3 komplette beregninger", "Rumvideo + tjekliste", "PDF-rapporter"],
      fi: ["3 valmista arviota", "Huonevideo + tarkistuslista", "PDF-raportit"],
      de: ["3 vollständige Schätzungen", "Raumvideo + Checkliste", "PDF-Berichte"],
      nl: ["3 complete schattingen", "Kamervideo + checklist", "PDF-rapporten"],
      fr: ["3 estimations complètes", "Vidéo de pièce + checklist", "Rapports PDF"],
      pl: ["3 pełne wyceny", "Nagranie pokoju + lista kontrolna", "Raporty PDF"],
      es: ["3 estimaciones completas", "Vídeo de la estancia + lista", "Informes PDF"],
      it: ["3 stime complete", "Video della stanza + checklist", "Report PDF"],
      pt: ["3 estimativas completas", "Vídeo da divisão + checklist", "Relatórios PDF"],
    }[lang] ?? ["3 complete estimates", "Room video + checklist", "PDF reports"],
  };

  const plans = [
    {
      name: "Business",
      price: "1 490",
      desc: pricingCopy.businessDesc,
      features: pricingCopy.businessFeatures,
      featured: true,
      priceId: "volumcalc_business_monthly_nok",
    },
    {
      name: "Enterprise",
      price: pricingCopy.enterprisePrice,
      desc: pricingCopy.enterpriseDesc,
      features: pricingCopy.enterpriseFeatures,
      featured: false,
      priceId: null,
    },
  ];

  const privatePlans = [
    {
      name: pricingCopy.singleName,
      price: "129",
      desc: pricingCopy.singleDesc,
      features: pricingCopy.singleFeatures,
      priceId: "volumcalc_single_estimate_nok",
    },
    {
      name: pricingCopy.bundleName,
      price: "299",
      desc: pricingCopy.bundleDesc,
      features: pricingCopy.bundleFeatures,
      priceId: "volumcalc_three_estimates_nok",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="surface-hero border-b border-border/60 px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{t("price.title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("price.sub")}</p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <UserRound className="size-5" />
            </span>
            <h2 className="text-2xl font-bold">{t("price.private")}</h2>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {privatePlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "card-soft flex flex-col p-7",
                  plan.priceId === "volumcalc_single_estimate_nok" &&
                    "border-primary shadow-[var(--shadow-lift)]",
                )}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-4 text-3xl font-bold">
                  {plan.price}{" "}
                  <span className="text-base font-medium text-muted-foreground">NOK</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.priceId ? (
                  <Button
                    className="mt-8"
                    variant={
                      plan.priceId === "volumcalc_single_estimate_nok" ? "default" : "outline"
                    }
                    onClick={() => setCheckout({ priceId: plan.priceId, name: plan.name })}
                  >
                    <LockKeyhole className="size-4" />
                    {t("payment.buy")}
                  </Button>
                ) : (
                  <Button asChild className="mt-8" variant="outline">
                    <Link to="/upload">{t("price.cta")}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 flex items-center gap-3 border-t border-border pt-16">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <h2 className="text-2xl font-bold">{t("price.business")}</h2>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "card-soft relative flex flex-col p-8",
                  plan.featured && "border-primary shadow-[var(--shadow-lift)]",
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t("price.popular")}
                  </span>
                )}
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="mt-4 text-3xl font-bold">
                  {plan.price}
                  {plan.price.match(/^[0-9\s]+$/) && (
                    <span className="text-base font-medium text-muted-foreground">
                      {" "}
                      NOK{t("price.month")}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.priceId ? (
                  <Button
                    className="mt-8"
                    variant="default"
                    onClick={() => setCheckout({ priceId: plan.priceId, name: plan.name })}
                  >
                    <LockKeyhole className="size-4" />
                    {t("payment.subscribe")}
                  </Button>
                ) : (
                  <Button asChild className="mt-8" variant="outline">
                    <Link to="/auth">{t("price.cta")}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <Dialog open={Boolean(checkout)} onOpenChange={(open) => !open && setCheckout(null)}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
          <DialogHeader className="border-b border-border px-6 py-5 pr-12">
            <DialogTitle>{checkout?.name}</DialogTitle>
            <DialogDescription>{t("payment.secure")}</DialogDescription>
          </DialogHeader>
          <div className="min-h-[560px] px-2 pb-5 sm:px-5">
            {checkout && (
              <StripeEmbeddedCheckout key={checkout.priceId} priceId={checkout.priceId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
