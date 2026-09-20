import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export type LegalSection = { heading: string; body: string[] };

export type LegalContent = {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalLayout({ content, children }: { content: LegalContent; children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h1>
          <p className="mt-4 text-muted-foreground">{content.intro}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{content.updated}</p>

          <div className="mt-10 space-y-8">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {children}

          <div className="card-soft mt-12 p-6 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">KM TECH LABS</p>
            <p className="mt-1">Kristiansand, Norge · Org.nr. 934 044 029</p>
            <p className="mt-1">kjell@volumcalc.com · volumcalc.com</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
