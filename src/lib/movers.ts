// Directory of moving companies that accept tender/quote requests.
// Links point to each company's own public quote form.
export type Mover = {
  name: string;
  country: string; // ISO-ish label used for grouping
  flag: string;
  url: string;
  note?: string;
};

export const MOVERS: Mover[] = [
  { name: "Adams Matkuljetus", country: "Finland", flag: "🇫🇮", url: "https://www.adamsmatkuljetus.fi/" },
  { name: "Alfa Moving", country: "Sverige", flag: "🇸🇪", url: "https://www.alfamoving.se/" },
  { name: "AGS Movers", country: "Frankrike", flag: "🇫🇷", url: "https://www.ags-globalsolutions.com/" },
  { name: "Adams Flytteekspress", country: "Norge", flag: "🇳🇴", url: "https://www.adams.no/" },
  { name: "Bohag Direkt", country: "Sverige", flag: "🇸🇪", url: "https://www.bohagdirekt.se/" },
  { name: "Bäckströms Flyttbyrå", country: "Sverige", flag: "🇸🇪", url: "https://www.backstroms.se/" },
  { name: "Clockwork Removals", country: "Storbritannia", flag: "🇬🇧", url: "https://www.clockworkremovals.co.uk/" },
  { name: "Crown Relocations", country: "Internasjonalt", flag: "🌍", url: "https://www.crownrelo.com/" },
  { name: "3F Flyttebyrå", country: "Norge", flag: "🇳🇴", url: "https://www.3f.no/" },
  { name: "Hasselknippe Flytting", country: "Norge", flag: "🇳🇴", url: "https://www.hasselknippe.no/" },
  { name: "Hasenkamp", country: "Tyskland", flag: "🇩🇪", url: "https://www.hasenkamp.com/" },
  { name: "Interflytt", country: "Norge", flag: "🇳🇴", url: "https://www.interflytt.no/" },
  { name: "Mobilboxes / Movinga", country: "Tyskland", flag: "🇩🇪", url: "https://www.movinga.de/" },
  { name: "Mover Transport Group", country: "Danmark", flag: "🇩🇰", url: "https://www.mover.dk/" },
  { name: "Nordisk Flytttransport", country: "Sverige", flag: "🇸🇪", url: "https://www.nordiskflytt.se/" },
  { name: "Pickfords", country: "Storbritannia", flag: "🇬🇧", url: "https://www.pickfords.co.uk/" },
  { name: "Santa Fe Relocation", country: "Internasjonalt", flag: "🌍", url: "https://www.santaferelo.com/" },
  { name: "Scanflytt", country: "Danmark", flag: "🇩🇰", url: "https://www.scanflytt.dk/" },
  { name: "Sirva / Allied", country: "Internasjonalt", flag: "🌍", url: "https://www.sirva.com/" },
  { name: "Stena Line Flytt", country: "Sverige", flag: "🇸🇪", url: "https://www.stenaline.se/" },
  { name: "Team Relocations", country: "Nederland", flag: "🇳🇱", url: "https://www.teamrelocations.com/" },
  { name: "Transpack Moving", country: "Polen", flag: "🇵🇱", url: "https://www.transpack.pl/" },
  { name: "Wridgways", country: "Internasjonalt", flag: "🌍", url: "https://www.wridgways.com.au/" },
  { name: "Ziegler Relocation", country: "Belgia/Nederland", flag: "🇧🇪", url: "https://www.zieglergroup.com/" },
];

export const MOVER_COUNTRIES = [...new Set(MOVERS.map((m) => m.country))].sort();
