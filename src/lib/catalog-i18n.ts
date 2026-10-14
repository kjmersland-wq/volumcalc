// Display names for the volume catalog and common rooms in the report languages
// that are not stored in the database (stored rows only carry name + name_no).
// Item arrays follow the order of UNIQUE_ITEM_NAMES_EN (checked at load time).
// Polish lives next to the catalog itself (name_pl).

export const UNIQUE_ITEM_NAMES_EN = [
  "High-back office chair",
  "Small computer desk",
  "Electric guitar",
  "Corner sofa",
  "Antique armchair",
  "Coffee table",
  "Large TV",
  "Kitchen table",
  "Kitchen chair",
  "Microwave",
  "Kitchen box",
  "White dresser",
  "Freestanding coat rack",
  "Filled cardboard box",
  "Bedding in bags",
  "Moving box",
  "Car wheel",
  "Double frame bed",
  "Wide dresser",
  "Bathroom cabinet",
  "Laundry basket",
  "Bathroom box",
  "Dining table",
  "Dining chair",
  "Sideboard",
  "Medium shelf",
  "Bag / soft goods",
  "Desktop PC tower",
  "Computer monitor",
  "Home printer",
  "Floor-standing speaker",
  "Guitar / instrument case",
  "Digital keyboard / piano",
  "Guitar amplifier",
  "Drum kit (packed)",
  "Bicycle",
  "Skis + poles (bag)",
  "Golf bag with clubs",
  "Exercise bike",
] as const;

export type ExtraLang = "sv" | "da" | "fi" | "de" | "nl" | "fr" | "es" | "it" | "pt";

const ITEMS: Record<ExtraLang, string[]> = {
  sv: [
    "Kontorsstol med hög rygg", "Litet datorbord", "Elgitarr",
    "Hörnsoffa", "Antik fåtölj", "Soffbord", "Stor TV",
    "Köksbord", "Köksstol", "Mikrovågsugn", "Kökslåda",
    "Vit byrå", "Fristående klädhängare", "Fylld kartong",
    "Sängkläder i påsar", "Flyttkartong", "Bildäck med fälg",
    "Dubbelsäng med ram", "Bred byrå", "Badrumsskåp", "Tvättkorg", "Badrumslåda",
    "Matbord", "Matstol", "Skänk", "Medelstor hylla", "Väska / mjuka saker",
    "Datorchassi (torn)", "Datorskärm", "Hemskrivare", "Golvhögtalare",
    "Gitarr-/instrumentfodral", "Keyboard / digitalpiano", "Gitarrförstärkare",
    "Trumset (packat)", "Cykel", "Skidor + stavar (väska)", "Golfbag med klubbor", "Motionscykel",
  ],
  da: [
    "Kontorstol med høj ryg", "Lille computerbord", "Elguitar",
    "Hjørnesofa", "Antik lænestol", "Sofabord", "Stort tv",
    "Køkkenbord", "Køkkenstol", "Mikrobølgeovn", "Køkkenkasse",
    "Hvid kommode", "Fritstående knagerække", "Fyldt papkasse",
    "Sengetøj i poser", "Flyttekasse", "Bilhjul",
    "Dobbeltseng med ramme", "Bred kommode", "Badeværelsesskab", "Vasketøjskurv", "Badeværelseskasse",
    "Spisebord", "Spisestol", "Skænk", "Mellemstor hylde", "Taske / bløde ting",
    "Computerkabinet (tårn)", "Computerskærm", "Printer til hjemmet", "Gulvhøjttaler",
    "Guitar-/instrumentkasse", "Keyboard / digitalt klaver", "Guitarforstærker",
    "Trommesæt (pakket)", "Cykel", "Ski + stave (taske)", "Golfbag med køller", "Motionscykel",
  ],
  fi: [
    "Korkeaselkäinen toimistotuoli", "Pieni tietokonepöytä", "Sähkökitara",
    "Kulmasohva", "Antiikkinen nojatuoli", "Sohvapöytä", "Iso televisio",
    "Keittiönpöytä", "Keittiön tuoli", "Mikroaaltouuni", "Keittiölaatikko",
    "Valkoinen lipasto", "Vapaasti seisova naulakko", "Täysi pahvilaatikko",
    "Vuodevaatteet pusseissa", "Muuttolaatikko", "Auton pyörä",
    "Kaksoisrunkosänky", "Leveä lipasto", "Kylpyhuoneen kaappi", "Pyykkikori", "Kylpyhuoneen laatikko",
    "Ruokapöytä", "Ruokapöydän tuoli", "Senkki", "Keskikokoinen hylly", "Laukku / pehmeät tavarat",
    "Pöytätietokone (kotelo)", "Tietokoneen näyttö", "Kotitulostin", "Lattiakaiutin",
    "Kitara- / soitinkotelo", "Kosketinsoitin / digitaalipiano", "Kitaravahvistin",
    "Rumpusetti (pakattu)", "Polkupyörä", "Sukset + sauvat (pussi)", "Golfbägi mailoineen", "Kuntopyörä",
  ],
  de: [
    "Bürostuhl mit hoher Rückenlehne", "Kleiner Computertisch", "E-Gitarre",
    "Ecksofa", "Antiker Sessel", "Couchtisch", "Großer Fernseher",
    "Küchentisch", "Küchenstuhl", "Mikrowelle", "Küchenkarton",
    "Weiße Kommode", "Freistehende Garderobe", "Gefüllter Karton",
    "Bettwäsche in Säcken", "Umzugskarton", "Autorad",
    "Doppelbett mit Rahmen", "Breite Kommode", "Badezimmerschrank", "Wäschekorb", "Badezimmerkarton",
    "Esstisch", "Esszimmerstuhl", "Sideboard", "Mittelgroßes Regal", "Tasche / weiche Sachen",
    "PC-Gehäuse (Tower)", "Computermonitor", "Drucker für zu Hause", "Standlautsprecher",
    "Gitarren-/Instrumentenkoffer", "Keyboard / E-Piano", "Gitarrenverstärker",
    "Schlagzeug (verpackt)", "Fahrrad", "Ski + Stöcke (Tasche)", "Golfbag mit Schlägern", "Heimtrainer",
  ],
  nl: [
    "Bureaustoel met hoge rug", "Klein computerbureau", "Elektrische gitaar",
    "Hoekbank", "Antieke fauteuil", "Salontafel", "Grote tv",
    "Keukentafel", "Keukenstoel", "Magnetron", "Keukendoos",
    "Witte ladekast", "Vrijstaande kapstok", "Gevulde kartonnen doos",
    "Beddengoed in zakken", "Verhuisdoos", "Autowiel",
    "Tweepersoonsbed met frame", "Brede ladekast", "Badkamerkast", "Wasmand", "Badkamerdoos",
    "Eettafel", "Eetkamerstoel", "Dressoir", "Middelgrote plank", "Tas / zachte spullen",
    "Computerkast (toren)", "Computermonitor", "Printer voor thuis", "Vloerluidspreker",
    "Gitaar-/instrumentkoffer", "Keyboard / digitale piano", "Gitaarversterker",
    "Drumstel (ingepakt)", "Fiets", "Ski's + stokken (tas)", "Golftas met clubs", "Hometrainer",
  ],
  fr: [
    "Fauteuil de bureau à dossier haut", "Petit bureau d'ordinateur", "Guitare électrique",
    "Canapé d'angle", "Fauteuil ancien", "Table basse", "Grand téléviseur",
    "Table de cuisine", "Chaise de cuisine", "Micro-ondes", "Carton de cuisine",
    "Commode blanche", "Porte-manteau sur pied", "Carton rempli",
    "Literie en sacs", "Carton de déménagement", "Roue de voiture",
    "Lit double avec cadre", "Commode large", "Meuble de salle de bains", "Panier à linge", "Carton de salle de bains",
    "Table à manger", "Chaise de salle à manger", "Buffet", "Étagère moyenne", "Sac / affaires souples",
    "Boîtier d'ordinateur (tour)", "Écran d'ordinateur", "Imprimante domestique", "Enceinte sur pied",
    "Étui de guitare / d'instrument", "Clavier / piano numérique", "Ampli de guitare",
    "Batterie (emballée)", "Vélo", "Skis + bâtons (housse)", "Sac de golf avec clubs", "Vélo d'appartement",
  ],
  es: [
    "Silla de oficina de respaldo alto", "Escritorio de ordenador pequeño", "Guitarra eléctrica",
    "Sofá rinconera", "Sillón antiguo", "Mesa de centro", "Televisor grande",
    "Mesa de cocina", "Silla de cocina", "Microondas", "Caja de cocina",
    "Cómoda blanca", "Perchero de pie", "Caja de cartón llena",
    "Ropa de cama en bolsas", "Caja de mudanza", "Rueda de coche",
    "Cama doble con estructura", "Cómoda ancha", "Armario de baño", "Cesto de la ropa", "Caja del baño",
    "Mesa de comedor", "Silla de comedor", "Aparador", "Estantería mediana", "Bolsa / cosas blandas",
    "Torre de ordenador", "Monitor de ordenador", "Impresora doméstica", "Altavoz de suelo",
    "Funda de guitarra / instrumento", "Teclado / piano digital", "Amplificador de guitarra",
    "Batería (embalada)", "Bicicleta", "Esquís + bastones (funda)", "Bolsa de golf con palos", "Bicicleta estática",
  ],
  it: [
    "Sedia da ufficio con schienale alto", "Piccola scrivania per computer", "Chitarra elettrica",
    "Divano ad angolo", "Poltrona antica", "Tavolino da salotto", "Grande TV",
    "Tavolo da cucina", "Sedia da cucina", "Forno a microonde", "Scatolone della cucina",
    "Cassettiera bianca", "Appendiabiti a piantana", "Scatolone pieno",
    "Biancheria da letto in sacchi", "Scatolone da trasloco", "Ruota d'auto",
    "Letto matrimoniale con telaio", "Cassettiera larga", "Mobile da bagno", "Cesto del bucato", "Scatolone del bagno",
    "Tavolo da pranzo", "Sedia da pranzo", "Credenza", "Scaffale medio", "Borsa / cose morbide",
    "Case del computer (tower)", "Monitor del computer", "Stampante domestica", "Cassa da pavimento",
    "Custodia per chitarra / strumento", "Tastiera / pianoforte digitale", "Amplificatore per chitarra",
    "Batteria (imballata)", "Bicicletta", "Sci + bastoncini (sacca)", "Sacca da golf con mazze", "Cyclette",
  ],
  pt: [
    "Cadeira de escritório de encosto alto", "Secretária de computador pequena", "Guitarra elétrica",
    "Sofá de canto", "Cadeirão antigo", "Mesa de centro", "Televisão grande",
    "Mesa de cozinha", "Cadeira de cozinha", "Micro-ondas", "Caixa da cozinha",
    "Cómoda branca", "Cabide de pé", "Caixa de cartão cheia",
    "Roupa de cama em sacos", "Caixa de mudança", "Roda de carro",
    "Cama de casal com estrutura", "Cómoda larga", "Armário de casa de banho", "Cesto da roupa", "Caixa da casa de banho",
    "Mesa de jantar", "Cadeira de jantar", "Aparador", "Estante média", "Mala / coisas macias",
    "Torre de computador", "Monitor de computador", "Impressora doméstica", "Coluna de chão",
    "Estojo de guitarra / instrumento", "Teclado / piano digital", "Amplificador de guitarra",
    "Bateria (embalada)", "Bicicleta", "Esquis + bastões (bolsa)", "Saco de golfe com tacos", "Bicicleta estática",
  ],
};

for (const [lang, names] of Object.entries(ITEMS)) {
  if (names.length !== UNIQUE_ITEM_NAMES_EN.length) {
    throw new Error(`catalog-i18n: ${lang} has ${names.length} names, expected ${UNIQUE_ITEM_NAMES_EN.length}`);
  }
}

/** Item name in one of the extra report languages, looked up by English catalog name. */
export function extraItemName(nameEn: string, lang: ExtraLang): string | undefined {
  const i = UNIQUE_ITEM_NAMES_EN.indexOf(nameEn as (typeof UNIQUE_ITEM_NAMES_EN)[number]);
  return i < 0 ? undefined : ITEMS[lang][i];
}

export type RoomKey =
  | "Living room"
  | "Bedroom"
  | "Kitchen"
  | "Hallway"
  | "Garage"
  | "Office"
  | "Dining room"
  | "Bathroom"
  | "Other";

// Room names per language; "basement" is the common suffix in e.g. "Office – basement".
export const EXTRA_ROOMS: Record<ExtraLang, Record<RoomKey | "basement", string>> = {
  sv: { "Living room": "Vardagsrum", Bedroom: "Sovrum", Kitchen: "Kök", Hallway: "Hall", Garage: "Garage", Office: "Kontor", "Dining room": "Matsal", Bathroom: "Badrum", Other: "Övrigt", basement: "källare" },
  da: { "Living room": "Stue", Bedroom: "Soveværelse", Kitchen: "Køkken", Hallway: "Entré", Garage: "Garage", Office: "Kontor", "Dining room": "Spisestue", Bathroom: "Badeværelse", Other: "Andet", basement: "kælder" },
  fi: { "Living room": "Olohuone", Bedroom: "Makuuhuone", Kitchen: "Keittiö", Hallway: "Eteinen", Garage: "Autotalli", Office: "Työhuone", "Dining room": "Ruokailuhuone", Bathroom: "Kylpyhuone", Other: "Muu", basement: "kellari" },
  de: { "Living room": "Wohnzimmer", Bedroom: "Schlafzimmer", Kitchen: "Küche", Hallway: "Flur", Garage: "Garage", Office: "Büro", "Dining room": "Esszimmer", Bathroom: "Badezimmer", Other: "Sonstiges", basement: "Keller" },
  nl: { "Living room": "Woonkamer", Bedroom: "Slaapkamer", Kitchen: "Keuken", Hallway: "Hal", Garage: "Garage", Office: "Kantoor", "Dining room": "Eetkamer", Bathroom: "Badkamer", Other: "Overig", basement: "kelder" },
  fr: { "Living room": "Salon", Bedroom: "Chambre", Kitchen: "Cuisine", Hallway: "Couloir", Garage: "Garage", Office: "Bureau", "Dining room": "Salle à manger", Bathroom: "Salle de bains", Other: "Autre", basement: "sous-sol" },
  es: { "Living room": "Salón", Bedroom: "Dormitorio", Kitchen: "Cocina", Hallway: "Pasillo", Garage: "Garaje", Office: "Despacho", "Dining room": "Comedor", Bathroom: "Baño", Other: "Otros", basement: "sótano" },
  it: { "Living room": "Soggiorno", Bedroom: "Camera da letto", Kitchen: "Cucina", Hallway: "Corridoio", Garage: "Garage", Office: "Ufficio", "Dining room": "Sala da pranzo", Bathroom: "Bagno", Other: "Altro", basement: "cantina" },
  pt: { "Living room": "Sala de estar", Bedroom: "Quarto", Kitchen: "Cozinha", Hallway: "Corredor", Garage: "Garagem", Office: "Escritório", "Dining room": "Sala de jantar", Bathroom: "Casa de banho", Other: "Outros", basement: "cave" },
};
