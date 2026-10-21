import type { Lang } from "./i18n";

/** Plan names, descriptions and feature lists on the pricing page, in every language. */
export type PriceKey =
  | "single"
  | "three"
  | "oneMove"
  | "save"
  | "bizDesc"
  | "talk"
  | "entDesc"
  | "comingSoon"
  | "loginFirst"
  | "fChecklist"
  | "fRooms"
  | "fPdfLink"
  | "fSaved"
  | "fThree"
  | "fCore"
  | "fBrand"
  | "fRate"
  | "fEmbed"
  | "fAll"
  | "fBranches"
  | "fApi"
  | "fContact"
  | "buy"
  | "subscribe";

type Table = Record<PriceKey, string>;

const en: Table = {
  buy: "Buy now",
  subscribe: "Subscribe",
  single: "Single estimate",
  three: "3 estimates",
  oneMove: "For one move",
  save: "Save {x}",
  bizDesc: "300 estimates per month",
  talk: "Talk to us",
  entDesc: "Unlimited volume",
  comingSoon: "Coming soon",
  loginFirst: "Log in or create an account first, so your purchase is attached to your account.",
  fChecklist: "Checklist with 120+ items",
  fRooms: "Room-by-room overview",
  fPdfLink: "PDF report and shareable link",
  fSaved: "Saved estimate",
  fThree: "3 complete estimates",
  fCore: "All core features",
  fBrand: "Your logo and colours",
  fRate: "Rate per m³ and quotes",
  fEmbed: "Customer link and embed code",
  fAll: "Everything in Business",
  fBranches: "Multiple branches",
  fApi: "API and integrations",
  fContact: "Dedicated contact",
};

const no: Table = {
  buy: "Kjøp nå",
  subscribe: "Abonner",
  single: "Én beregning",
  three: "3 beregninger",
  oneMove: "For én flytting",
  save: "Spar {x}",
  bizDesc: "300 beregninger per måned",
  talk: "Kontakt oss",
  entDesc: "Ubegrenset volum",
  comingSoon: "Kommer snart",
  loginFirst: "Logg inn eller opprett en konto først, så kjøpet knyttes til kontoen din.",
  fChecklist: "Sjekkliste med 120+ gjenstander",
  fRooms: "Romvis oversikt",
  fPdfLink: "PDF-rapport og delbar lenke",
  fSaved: "Lagret beregning",
  fThree: "3 komplette beregninger",
  fCore: "Alle basisfunksjoner",
  fBrand: "Egen logo og farger",
  fRate: "Pris per m³ og tilbud",
  fEmbed: "Kundelenke og embed-kode",
  fAll: "Alt i Business",
  fBranches: "Flere avdelinger",
  fApi: "API og integrasjoner",
  fContact: "Egen kundekontakt",
};

const sv: Table = {
  buy: "Köp nu",
  subscribe: "Prenumerera",
  single: "En beräkning",
  three: "3 beräkningar",
  oneMove: "För en flytt",
  save: "Spara {x}",
  bizDesc: "300 beräkningar per månad",
  talk: "Kontakta oss",
  entDesc: "Obegränsad volym",
  comingSoon: "Kommer snart",
  loginFirst: "Logga in eller skapa ett konto först, så knyts köpet till ditt konto.",
  fChecklist: "Checklista med 120+ föremål",
  fRooms: "Översikt rum för rum",
  fPdfLink: "PDF-rapport och delbar länk",
  fSaved: "Sparad beräkning",
  fThree: "3 kompletta beräkningar",
  fCore: "Alla grundfunktioner",
  fBrand: "Egen logotyp och färger",
  fRate: "Pris per m³ och offerter",
  fEmbed: "Kundlänk och embed-kod",
  fAll: "Allt i Business",
  fBranches: "Flera avdelningar",
  fApi: "API och integrationer",
  fContact: "Egen kontaktperson",
};

const da: Table = {
  buy: "Køb nu",
  subscribe: "Abonnér",
  single: "Én beregning",
  three: "3 beregninger",
  oneMove: "Til én flytning",
  save: "Spar {x}",
  bizDesc: "300 beregninger pr. måned",
  talk: "Kontakt os",
  entDesc: "Ubegrænset volumen",
  comingSoon: "Kommer snart",
  loginFirst: "Log ind eller opret en konto først, så købet knyttes til din konto.",
  fChecklist: "Tjekliste med 120+ genstande",
  fRooms: "Rum-for-rum-oversigt",
  fPdfLink: "PDF-rapport og delbart link",
  fSaved: "Gemt beregning",
  fThree: "3 komplette beregninger",
  fCore: "Alle grundfunktioner",
  fBrand: "Eget logo og egne farver",
  fRate: "Pris pr. m³ og tilbud",
  fEmbed: "Kundelink og embed-kode",
  fAll: "Alt i Business",
  fBranches: "Flere afdelinger",
  fApi: "API og integrationer",
  fContact: "Egen kontaktperson",
};

const fi: Table = {
  buy: "Osta nyt",
  subscribe: "Tilaa",
  single: "Yksi laskelma",
  three: "3 laskelmaa",
  oneMove: "Yhteen muuttoon",
  save: "Säästä {x}",
  bizDesc: "300 laskelmaa kuukaudessa",
  talk: "Ota yhteyttä",
  entDesc: "Rajaton volyymi",
  comingSoon: "Tulossa pian",
  loginFirst: "Kirjaudu sisään tai luo tili ensin, jotta ostos liitetään tiliisi.",
  fChecklist: "Tarkistuslista, 120+ esinettä",
  fRooms: "Huonekohtainen yhteenveto",
  fPdfLink: "PDF-raportti ja jaettava linkki",
  fSaved: "Tallennettu laskelma",
  fThree: "3 täydellistä laskelmaa",
  fCore: "Kaikki perusominaisuudet",
  fBrand: "Oma logo ja värit",
  fRate: "Hinta per m³ ja tarjoukset",
  fEmbed: "Asiakaslinkki ja upotuskoodi",
  fAll: "Kaikki Business-paketista",
  fBranches: "Useita toimipisteitä",
  fApi: "API ja integraatiot",
  fContact: "Oma yhteyshenkilö",
};

const de: Table = {
  buy: "Jetzt kaufen",
  subscribe: "Abonnieren",
  single: "Einzelberechnung",
  three: "3 Berechnungen",
  oneMove: "Für einen Umzug",
  save: "Sparen Sie {x}",
  bizDesc: "300 Berechnungen pro Monat",
  talk: "Kontakt aufnehmen",
  entDesc: "Unbegrenztes Volumen",
  comingSoon: "Demnächst verfügbar",
  loginFirst: "Melden Sie sich zuerst an oder erstellen Sie ein Konto, damit der Kauf Ihrem Konto zugeordnet wird.",
  fChecklist: "Checkliste mit 120+ Gegenständen",
  fRooms: "Übersicht Raum für Raum",
  fPdfLink: "PDF-Bericht und teilbarer Link",
  fSaved: "Gespeicherte Berechnung",
  fThree: "3 vollständige Berechnungen",
  fCore: "Alle Grundfunktionen",
  fBrand: "Eigenes Logo und eigene Farben",
  fRate: "Preis pro m³ und Angebote",
  fEmbed: "Kundenlink und Embed-Code",
  fAll: "Alles aus Business",
  fBranches: "Mehrere Niederlassungen",
  fApi: "API und Integrationen",
  fContact: "Persönlicher Ansprechpartner",
};

const nl: Table = {
  buy: "Nu kopen",
  subscribe: "Abonneren",
  single: "Eén berekening",
  three: "3 berekeningen",
  oneMove: "Voor één verhuizing",
  save: "Bespaar {x}",
  bizDesc: "300 berekeningen per maand",
  talk: "Neem contact op",
  entDesc: "Onbeperkt volume",
  comingSoon: "Binnenkort beschikbaar",
  loginFirst: "Log eerst in of maak een account aan, zodat je aankoop aan je account wordt gekoppeld.",
  fChecklist: "Checklist met 120+ items",
  fRooms: "Overzicht kamer voor kamer",
  fPdfLink: "Pdf-rapport en deelbare link",
  fSaved: "Opgeslagen berekening",
  fThree: "3 complete berekeningen",
  fCore: "Alle basisfuncties",
  fBrand: "Eigen logo en kleuren",
  fRate: "Prijs per m³ en offertes",
  fEmbed: "Klantlink en embedcode",
  fAll: "Alles uit Business",
  fBranches: "Meerdere vestigingen",
  fApi: "API en integraties",
  fContact: "Vaste contactpersoon",
};

const fr: Table = {
  buy: "Acheter",
  subscribe: "S’abonner",
  single: "Une estimation",
  three: "3 estimations",
  oneMove: "Pour un déménagement",
  save: "Économisez {x}",
  bizDesc: "300 estimations par mois",
  talk: "Nous contacter",
  entDesc: "Volume illimité",
  comingSoon: "Bientôt disponible",
  loginFirst: "Connectez-vous ou créez d’abord un compte, afin que l’achat soit rattaché à votre compte.",
  fChecklist: "Liste avec plus de 120 objets",
  fRooms: "Aperçu pièce par pièce",
  fPdfLink: "Rapport PDF et lien partageable",
  fSaved: "Estimation enregistrée",
  fThree: "3 estimations complètes",
  fCore: "Toutes les fonctions de base",
  fBrand: "Votre logo et vos couleurs",
  fRate: "Prix au m³ et devis",
  fEmbed: "Lien client et code d’intégration",
  fAll: "Tout ce qui est inclus dans Business",
  fBranches: "Plusieurs agences",
  fApi: "API et intégrations",
  fContact: "Interlocuteur dédié",
};

const pl: Table = {
  buy: "Kup teraz",
  subscribe: "Subskrybuj",
  single: "Jedno wyliczenie",
  three: "3 wyliczenia",
  oneMove: "Na jedną przeprowadzkę",
  save: "Oszczędzasz {x}",
  bizDesc: "300 wyliczeń miesięcznie",
  talk: "Skontaktuj się z nami",
  entDesc: "Nielimitowana objętość",
  comingSoon: "Wkrótce",
  loginFirst: "Najpierw zaloguj się lub załóż konto, aby zakup został przypisany do Twojego konta.",
  fChecklist: "Lista kontrolna z ponad 120 przedmiotami",
  fRooms: "Przegląd pokój po pokoju",
  fPdfLink: "Raport PDF i link do udostępniania",
  fSaved: "Zapisane wyliczenie",
  fThree: "3 pełne wyliczenia",
  fCore: "Wszystkie podstawowe funkcje",
  fBrand: "Własne logo i kolory",
  fRate: "Cena za m³ i oferty",
  fEmbed: "Link dla klientów i kod osadzenia",
  fAll: "Wszystko z pakietu Business",
  fBranches: "Wiele oddziałów",
  fApi: "API i integracje",
  fContact: "Dedykowany opiekun",
};

const es: Table = {
  buy: "Comprar",
  subscribe: "Suscribirse",
  single: "Una estimación",
  three: "3 estimaciones",
  oneMove: "Para una mudanza",
  save: "Ahorra {x}",
  bizDesc: "300 estimaciones al mes",
  talk: "Contáctanos",
  entDesc: "Volumen ilimitado",
  comingSoon: "Próximamente",
  loginFirst: "Inicia sesión o crea una cuenta primero, para que la compra quede asociada a tu cuenta.",
  fChecklist: "Lista con más de 120 objetos",
  fRooms: "Resumen habitación por habitación",
  fPdfLink: "Informe PDF y enlace para compartir",
  fSaved: "Estimación guardada",
  fThree: "3 estimaciones completas",
  fCore: "Todas las funciones básicas",
  fBrand: "Tu logotipo y tus colores",
  fRate: "Precio por m³ y presupuestos",
  fEmbed: "Enlace para clientes y código para insertar",
  fAll: "Todo lo de Business",
  fBranches: "Varias sucursales",
  fApi: "API e integraciones",
  fContact: "Contacto dedicado",
};

const it: Table = {
  buy: "Acquista",
  subscribe: "Abbonati",
  single: "Una stima",
  three: "3 stime",
  oneMove: "Per un trasloco",
  save: "Risparmia {x}",
  bizDesc: "300 stime al mese",
  talk: "Contattaci",
  entDesc: "Volume illimitato",
  comingSoon: "Prossimamente",
  loginFirst: "Accedi o crea prima un account, così l’acquisto sarà associato al tuo account.",
  fChecklist: "Lista con oltre 120 oggetti",
  fRooms: "Panoramica stanza per stanza",
  fPdfLink: "Rapporto PDF e link condivisibile",
  fSaved: "Stima salvata",
  fThree: "3 stime complete",
  fCore: "Tutte le funzioni di base",
  fBrand: "Il tuo logo e i tuoi colori",
  fRate: "Prezzo al m³ e preventivi",
  fEmbed: "Link per i clienti e codice di incorporamento",
  fAll: "Tutto ciò che è in Business",
  fBranches: "Più sedi",
  fApi: "API e integrazioni",
  fContact: "Referente dedicato",
};

const pt: Table = {
  buy: "Comprar",
  subscribe: "Subscrever",
  single: "Uma estimativa",
  three: "3 estimativas",
  oneMove: "Para uma mudança",
  save: "Poupe {x}",
  bizDesc: "300 estimativas por mês",
  talk: "Fale connosco",
  entDesc: "Volume ilimitado",
  comingSoon: "Brevemente",
  loginFirst: "Inicie sessão ou crie primeiro uma conta, para que a compra fique associada à sua conta.",
  fChecklist: "Lista com mais de 120 objetos",
  fRooms: "Resumo divisão a divisão",
  fPdfLink: "Relatório PDF e ligação partilhável",
  fSaved: "Estimativa guardada",
  fThree: "3 estimativas completas",
  fCore: "Todas as funcionalidades base",
  fBrand: "O seu logótipo e as suas cores",
  fRate: "Preço por m³ e orçamentos",
  fEmbed: "Ligação para clientes e código de incorporação",
  fAll: "Tudo o que está no Business",
  fBranches: "Várias filiais",
  fApi: "API e integrações",
  fContact: "Contacto dedicado",
};

const TABLES: Record<Lang, Table> = { en, no, sv, da, fi, de, nl, fr, pl, es, it, pt };

export function px(lang: Lang, key: PriceKey, vars?: Record<string, string | number>): string {
  let text = (TABLES[lang] ?? en)[key] ?? en[key];
  if (vars) for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
}
