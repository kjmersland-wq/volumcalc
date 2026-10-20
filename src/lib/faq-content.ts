import type { Lang } from "./i18n";

export type FaqItem = { q: string; a: string };
export type FaqGroup = { heading: string; items: FaqItem[] };
export type FaqContent = {
  title: string;
  intro: string;
  ctaTitle: string;
  ctaText: string;
  cta: string;
  contact: string;
  groups: FaqGroup[];
};

/** Help / FAQ page content in every language the site offers. */
export const FAQ: Record<Lang, FaqContent> = {
  en: {
    title: "Help and frequently asked questions",
    intro: "Everything you need to use the VolumCalc moving volume calculator — from the checklist and m³ estimate to a polished report, sharing and pricing.",
    ctaTitle: "Didn't find your answer?",
    ctaText: "Send us a few words and we usually reply within one business day.",
    cta: "Start a free estimate",
    contact: "Contact us",
    groups: [
      {
        heading: "The checklist",
        items: [
          { q: "How do I pick items?", a: "Choose a room and tap + on whatever is moving. The checklist has 120+ common items with standard dimensions, and you can search across all rooms. Totals update as you go." },
          { q: "What if my item is not on the list?", a: "Add a custom item with a name, length, width and height in cm and a quantity. Weight and notes are optional. Volume is calculated as length × width × height × quantity and included in the totals and the report." },
          { q: "What do Moving, Maybe and Not moving mean?", a: "Every item can be set to Moving, Maybe or Not moving. Not moving is left out of the volume. Maybe is included in the total but highlighted in the report and PDF, so you or the moving company can decide on it." },
        ],
      },
      {
        heading: "Volume and vehicle",
        items: [
          { q: "What is net volume versus recommended volume?", a: "Net volume is the sum of the items. Recommended volume adds a 25% stowage factor for air between furniture, and is the figure to use when choosing a vehicle or storage unit." },
          { q: "Which van or truck do I need?", a: "The calculator and the report show a recommended vehicle automatically, based on the recommended volume (net plus a 25% buffer). You can also work it out in our moving van calculator." },
        ],
      },
      {
        heading: "Rooms, editing and logistics",
        items: [
          { q: "Can I add my own rooms?", a: "Yes. Type the name of a new room in the calculator, or set up your room list under settings if you are a moving company." },
          { q: "Can I add packing help, storage and a delivery address?", a: "Yes. In a saved report you can request packing help (scope and materials), note interim storage, and enter the new address with floor, lift and carry distance. Everything is carried into the PDF." },
        ],
      },
      {
        heading: "Free, PDF and sharing",
        items: [
          { q: "What is free and what do I pay for?", a: "The calculator is free for everyone: choose items, see volume and the recommended vehicle. Saving the estimate, the PDF download and the shareable link come with a paid estimate (single or 3-pack)." },
          { q: "Can I get the PDF in my language?", a: "Yes. Choose the PDF language from the 12 languages on the site, both when you create a new report and when you download an existing one. Everything you wrote yourself is kept — only the fixed headings and labels change." },
          { q: "How do I share the report?", a: "Use “Share secret link”. Anyone with the link can view the report without signing in, so only share it with the intended recipients." },
        ],
      },
      {
        heading: "For moving companies",
        items: [
          { q: "How do we receive requests from customers?", a: "Copy the customer link or the embed code from the dashboard and put it on your website. When a customer submits, you get an email with the volume, items, addresses with floor, lift, carry distance and mobile number, preferred date and contact details. The request also lands in your dashboard with a status of New, Viewed, Quoted, Accepted or Archived." },
          { q: "Can we use our own logo and set our own prices?", a: "Yes. In the company profile you add logo, brand colour, company details and your rate per m³ and currency. They appear at the top of the report and the PDF, and the report calculates the estimated price automatically. Tender mode hides prices when you invite bids." },
        ],
      },
      {
        heading: "Pricing and privacy",
        items: [
          { q: "What does it cost?", a: "The calculator is free. A single estimate or a pack of three unlocks saving, PDF and sharing. Moving companies have their own subscription. See the pricing page for current prices." },
          { q: "What happens to my data?", a: "Your estimates are stored privately and are never public. They are deleted no later than 12 months after the last activity. You can request deletion at any time at kjell@volumcalc.com." },
        ],
      },
    ],
  },
  no: {
    title: "Hjelp og ofte stilte spørsmål",
    intro: "Alt du trenger for å bruke flyttevolum-kalkulatoren VolumCalc – fra sjekkliste og m³-beregning til ferdig rapport, deling og priser.",
    ctaTitle: "Fant du ikke svaret?",
    ctaText: "Send oss noen ord, så svarer vi vanligvis innen én virkedag.",
    cta: "Start en gratis beregning",
    contact: "Kontakt oss",
    groups: [
      {
        heading: "Sjekklisten",
        items: [
          { q: "Hvordan velger jeg gjenstander?", a: "Velg et rom og trykk + på det som skal flyttes. Sjekklisten har over 120 vanlige gjenstander med standardmål, og du kan søke i alle rom. Totalen oppdateres underveis." },
          { q: "Hva om gjenstanden min ikke står på listen?", a: "Legg til en egen gjenstand med navn, lengde, bredde og høyde i cm og antall. Vekt og notater er valgfritt. Volumet regnes ut som lengde × bredde × høyde × antall og tas med i totalen og rapporten." },
          { q: "Hva betyr Flytter, Kanskje og Flytter ikke?", a: "Hver gjenstand kan settes til Flytter, Kanskje eller Flytter ikke. Flytter ikke regnes ikke med i volumet. Kanskje er med i totalen, men utheves i rapporten og PDF-en, slik at du eller flyttefirmaet kan ta stilling til dem." },
        ],
      },
      {
        heading: "Volum og bil",
        items: [
          { q: "Hva betyr nettovolum og anbefalt volum?", a: "Nettovolum er summen av gjenstandene. Anbefalt volum legger på 25 % stuefaktor for luft mellom møblene, og er tallet du bør bruke når du velger bil eller lagerrom." },
          { q: "Hvilken bil trenger jeg?", a: "Kalkulatoren og rapporten viser anbefalt bil automatisk, basert på anbefalt volum (netto pluss 25 % buffer). Du kan også regne på det selv i flyttebil-kalkulatoren vår." },
        ],
      },
      {
        heading: "Rom, redigering og logistikk",
        items: [
          { q: "Kan jeg legge til egne rom?", a: "Ja. Skriv inn navn på et nytt rom i kalkulatoren, eller sett opp romlisten din under innstillinger hvis du er flyttefirma." },
          { q: "Kan jeg be om pakkehjelp, lagring og legge inn ny adresse?", a: "Ja. I en lagret rapport kan du be om pakkehjelp (omfang og materiell), notere mellomlagring og legge inn ny adresse med etasje, heis og bæreavstand. Alt følger med i PDF-en." },
        ],
      },
      {
        heading: "Gratis, PDF og deling",
        items: [
          { q: "Hva er gratis, og hva betaler jeg for?", a: "Kalkulatoren er gratis for alle: velg gjenstander, se volum og anbefalt bil. Å lagre beregningen, laste ned PDF og få en delbar lenke følger med en betalt beregning (én eller pakke med tre)." },
          { q: "Kan jeg få PDF-en på mitt språk?", a: "Ja. Velg PDF-språk blant de 12 språkene på nettsiden, både når du lager en ny rapport og når du laster ned en eksisterende. Alt du har skrevet selv beholdes – det er kun faste overskrifter og etiketter som byttes." },
          { q: "Hvordan deler jeg rapporten?", a: "Bruk «Del hemmelig lenke». Den som har lenken ser rapporten uten å logge inn, så del den bare med dem som skal se den." },
        ],
      },
      {
        heading: "For flyttebyråer",
        items: [
          { q: "Hvordan får vi forespørsler fra kunder?", a: "Kopier kundelenken eller embed-koden fra dashbordet og legg den på nettsiden din. Når en kunde sender inn, får dere en e-post med volum, gjenstander, adresser med etasje, heis, bæreavstand og mobilnummer, ønsket dato og kontaktinfo. Forespørselen havner også i dashbordet med status Ny, Sett, Tilbud sendt, Akseptert eller Arkivert." },
          { q: "Kan vi bruke vår egen logo og sette egne priser?", a: "Ja. Under firmaprofil legger du inn logo, merkefarge, firmadetaljer og pris per m³ med valuta. Det vises øverst i rapporten og PDF-en, og rapporten regner ut estimert pris automatisk. Anbudsmodus skjuler prisene når dere sender ut på anbud." },
        ],
      },
      {
        heading: "Priser og personvern",
        items: [
          { q: "Hva koster det?", a: "Kalkulatoren er gratis. Én beregning eller en pakke med tre låser opp lagring, PDF og deling. Flyttebyråer har eget abonnement. Se prissiden for gjeldende priser." },
          { q: "Hva skjer med dataene mine?", a: "Beregningene ligger privat og er ikke offentlige. De slettes senest 12 måneder etter siste aktivitet. Du kan be om sletting når som helst på kjell@volumcalc.com." },
        ],
      },
    ],
  },
  sv: {
    title: "Hjälp och vanliga frågor",
    intro: "Allt du behöver för att komma igång med VolumCalc – från checklista till färdig rapport, delning och priser.",
    ctaTitle: "Hittade du inte svaret?",
    ctaText: "Skriv några rader så svarar vi vanligtvis inom en arbetsdag.",
    cta: "Starta en gratis beräkning",
    contact: "Kontakta oss",
    groups: [
      {
        heading: "Checklistan",
        items: [
          { q: "Hur väljer jag föremål?", a: "Välj ett rum och tryck på + vid det som ska flyttas. Checklistan har över 120 vanliga föremål med standardmått, och du kan söka i alla rum. Totalen uppdateras löpande." },
          { q: "Vad gör jag om mitt föremål inte finns i listan?", a: "Lägg till ett eget föremål med namn, längd, bredd och höjd i cm samt antal. Vikt och anteckningar är valfria. Volymen räknas ut som längd × bredd × höjd × antal och ingår i totalen och rapporten." },
          { q: "Vad betyder Flyttas, Kanske och Flyttas inte?", a: "Varje föremål kan sättas till Flyttas, Kanske eller Flyttas inte. Flyttas inte räknas inte med i volymen. Kanske ingår i totalen men markeras i rapporten och PDF:en, så att du eller flyttfirman kan ta ställning." },
        ],
      },
      {
        heading: "Volym och bil",
        items: [
          { q: "Vad är nettovolym respektive rekommenderad volym?", a: "Nettovolym är summan av föremålen. Rekommenderad volym lägger på 25 % packfaktor för luft mellan möblerna och är siffran du bör använda när du väljer bil eller förråd." },
          { q: "Vilken bil behöver jag?", a: "Kalkylatorn och rapporten visar rekommenderad bil automatiskt, utifrån rekommenderad volym (netto plus 25 % marginal). Du kan också räkna själv i vår flyttbilskalkylator." },
        ],
      },
      {
        heading: "Rum, redigering och logistik",
        items: [
          { q: "Kan jag lägga till egna rum?", a: "Ja. Skriv namnet på ett nytt rum i kalkylatorn, eller ställ in din rumslista under inställningar om du är flyttfirma." },
          { q: "Kan jag be om packhjälp, magasinering och ange ny adress?", a: "Ja. I en sparad rapport kan du be om packhjälp (omfattning och material), notera mellanlagring och ange den nya adressen med våning, hiss och bärsträcka. Allt följer med i PDF:en." },
        ],
      },
      {
        heading: "Gratis, PDF och delning",
        items: [
          { q: "Vad är gratis och vad betalar jag för?", a: "Kalkylatorn är gratis för alla: välj föremål, se volym och rekommenderad bil. Att spara beräkningen, ladda ner PDF och få en delbar länk ingår i en betald beräkning (en eller paket med tre)." },
          { q: "Kan jag få PDF:en på mitt språk?", a: "Ja. Välj PDF-språk bland de 12 språken på webbplatsen, både när du skapar en ny rapport och när du laddar ner en befintlig. Allt du skrivit själv behålls – bara fasta rubriker och etiketter byts." },
          { q: "Hur delar jag rapporten?", a: "Använd ”Dela hemlig länk”. Den som har länken ser rapporten utan att logga in, så dela den bara med dem som ska se den." },
        ],
      },
      {
        heading: "För flyttfirmor",
        items: [
          { q: "Hur får vi förfrågningar från kunder?", a: "Kopiera kundlänken eller embed-koden från instrumentpanelen och lägg den på er webbplats. När en kund skickar in får ni ett e-postmeddelande med volym, föremål, adresser med våning, hiss, bärsträcka och mobilnummer, önskat datum och kontaktuppgifter. Förfrågan hamnar också i instrumentpanelen med status Ny, Sedd, Offert skickad, Accepterad eller Arkiverad." },
          { q: "Kan vi använda vår egen logotyp och sätta egna priser?", a: "Ja. I företagsprofilen lägger du in logotyp, varumärkesfärg, företagsuppgifter samt pris per m³ och valuta. De visas överst i rapporten och PDF:en, och rapporten räknar ut uppskattat pris automatiskt. Anbudsläget döljer priserna när ni begär anbud." },
        ],
      },
      {
        heading: "Priser och integritet",
        items: [
          { q: "Vad kostar det?", a: "Kalkylatorn är gratis. En beräkning eller ett paket med tre låser upp sparande, PDF och delning. Flyttfirmor har eget abonnemang. Se prissidan för aktuella priser." },
          { q: "Vad händer med mina uppgifter?", a: "Dina beräkningar lagras privat och är aldrig offentliga. De raderas senast 12 månader efter senaste aktivitet. Du kan begära radering när som helst på kjell@volumcalc.com." },
        ],
      },
    ],
  },
  da: {
    title: "Hjælp og ofte stillede spørgsmål",
    intro: "Alt du skal bruge for at komme i gang med VolumCalc – fra tjekliste til færdig rapport, deling og priser.",
    ctaTitle: "Fandt du ikke svaret?",
    ctaText: "Skriv et par ord til os, så svarer vi normalt inden for én arbejdsdag.",
    cta: "Start en gratis beregning",
    contact: "Kontakt os",
    groups: [
      {
        heading: "Tjeklisten",
        items: [
          { q: "Hvordan vælger jeg genstande?", a: "Vælg et rum og tryk på + ved det, der skal flyttes. Tjeklisten har over 120 almindelige genstande med standardmål, og du kan søge i alle rum. Totalen opdateres undervejs." },
          { q: "Hvad hvis min genstand ikke står på listen?", a: "Tilføj en egen genstand med navn, længde, bredde og højde i cm samt antal. Vægt og noter er valgfrie. Volumen beregnes som længde × bredde × højde × antal og indgår i totalen og rapporten." },
          { q: "Hvad betyder Flytter, Måske og Flytter ikke?", a: "Hver genstand kan sættes til Flytter, Måske eller Flytter ikke. Flytter ikke tælles ikke med i volumen. Måske indgår i totalen, men fremhæves i rapporten og PDF'en, så du eller flyttefirmaet kan tage stilling." },
        ],
      },
      {
        heading: "Volumen og bil",
        items: [
          { q: "Hvad er nettovolumen og anbefalet volumen?", a: "Nettovolumen er summen af genstandene. Anbefalet volumen lægger 25 % pakkefaktor oveni til luft mellem møblerne og er tallet, du bør bruge, når du vælger bil eller lagerrum." },
          { q: "Hvilken bil har jeg brug for?", a: "Beregneren og rapporten viser automatisk en anbefalet bil ud fra anbefalet volumen (netto plus 25 % buffer). Du kan også regne selv i vores flyttebilsberegner." },
        ],
      },
      {
        heading: "Rum, redigering og logistik",
        items: [
          { q: "Kan jeg tilføje egne rum?", a: "Ja. Skriv navnet på et nyt rum i beregneren, eller sæt din rumliste op under indstillinger, hvis du er flyttefirma." },
          { q: "Kan jeg bede om pakkehjælp, opbevaring og angive ny adresse?", a: "Ja. I en gemt rapport kan du bede om pakkehjælp (omfang og materialer), notere mellemlagring og angive den nye adresse med etage, elevator og bæreafstand. Alt følger med i PDF'en." },
        ],
      },
      {
        heading: "Gratis, PDF og deling",
        items: [
          { q: "Hvad er gratis, og hvad betaler jeg for?", a: "Beregneren er gratis for alle: vælg genstande, se volumen og anbefalet bil. At gemme beregningen, downloade PDF og få et delbart link følger med en betalt beregning (én eller en pakke med tre)." },
          { q: "Kan jeg få PDF'en på mit sprog?", a: "Ja. Vælg PDF-sprog blandt de 12 sprog på siden, både når du opretter en ny rapport, og når du downloader en eksisterende. Alt, du selv har skrevet, bevares – kun faste overskrifter og etiketter skiftes." },
          { q: "Hvordan deler jeg rapporten?", a: "Brug “Del hemmeligt link”. Den, der har linket, kan se rapporten uden at logge ind, så del det kun med dem, der skal se den." },
        ],
      },
      {
        heading: "For flyttefirmaer",
        items: [
          { q: "Hvordan modtager vi forespørgsler fra kunder?", a: "Kopiér kundelinket eller embed-koden fra dashboardet og læg det på jeres hjemmeside. Når en kunde sender ind, får I en e-mail med volumen, genstande, adresser med etage, elevator, bæreafstand og mobilnummer, ønsket dato og kontaktoplysninger. Forespørgslen lander også i dashboardet med status Ny, Set, Tilbud sendt, Accepteret eller Arkiveret." },
          { q: "Kan vi bruge vores eget logo og sætte egne priser?", a: "Ja. I firmaprofilen angiver du logo, brandfarve, firmaoplysninger samt pris pr. m³ og valuta. De vises øverst i rapporten og PDF'en, og rapporten beregner den estimerede pris automatisk. Udbudstilstand skjuler priserne, når I indhenter tilbud." },
        ],
      },
      {
        heading: "Priser og privatliv",
        items: [
          { q: "Hvad koster det?", a: "Beregneren er gratis. Én beregning eller en pakke med tre låser op for gemning, PDF og deling. Flyttefirmaer har deres eget abonnement. Se prissiden for aktuelle priser." },
          { q: "Hvad sker der med mine data?", a: "Dine beregninger gemmes privat og er aldrig offentlige. De slettes senest 12 måneder efter sidste aktivitet. Du kan til enhver tid bede om sletning på kjell@volumcalc.com." },
        ],
      },
    ],
  },
  fi: {
    title: "Ohje ja usein kysytyt kysymykset",
    intro: "Kaikki mitä tarvitset VolumCalcin käyttöönottoon – tarkistuslistasta valmiiseen raporttiin, jakamiseen ja hintoihin.",
    ctaTitle: "Etkö löytänyt vastausta?",
    ctaText: "Lähetä meille muutama sana, niin vastaamme yleensä yhden arkipäivän kuluessa.",
    cta: "Aloita ilmainen laskelma",
    contact: "Ota yhteyttä",
    groups: [
      {
        heading: "Tarkistuslista",
        items: [
          { q: "Miten valitsen esineet?", a: "Valitse huone ja napauta +-painiketta muutettavan esineen kohdalla. Tarkistuslistassa on yli 120 yleistä esinettä vakiomittoineen, ja voit hakea kaikista huoneista. Kokonaismäärä päivittyy samalla." },
          { q: "Entä jos esinettäni ei ole listalla?", a: "Lisää oma esine nimellä, pituudella, leveydellä ja korkeudella (cm) sekä määrällä. Paino ja muistiinpanot ovat valinnaisia. Tilavuus lasketaan pituus × leveys × korkeus × määrä ja se sisältyy kokonaismäärään ja raporttiin." },
          { q: "Mitä tarkoittavat Muuttaa, Ehkä ja Ei muuteta?", a: "Jokaisen esineen voi asettaa tilaan Muuttaa, Ehkä tai Ei muuteta. Ei muuteta -esineet jätetään tilavuudesta pois. Ehkä-esineet ovat mukana kokonaismäärässä mutta korostettuna raportissa ja PDF:ssä, jotta sinä tai muuttofirma voitte päättää niistä." },
        ],
      },
      {
        heading: "Tilavuus ja auto",
        items: [
          { q: "Mitä ovat nettotilavuus ja suositeltu tilavuus?", a: "Nettotilavuus on esineiden summa. Suositeltu tilavuus lisää 25 %:n pakkausvaran huonekalujen väliseen ilmaan, ja sitä kannattaa käyttää auton tai varaston valinnassa." },
          { q: "Minkä auton tarvitsen?", a: "Laskuri ja raportti näyttävät suositellun auton automaattisesti suositellun tilavuuden perusteella (netto + 25 % varaa). Voit laskea myös itse muuttoautolaskurissamme." },
        ],
      },
      {
        heading: "Huoneet, muokkaus ja logistiikka",
        items: [
          { q: "Voinko lisätä omia huoneita?", a: "Kyllä. Kirjoita uuden huoneen nimi laskuriin tai määritä huonelistasi asetuksissa, jos olet muuttofirma." },
          { q: "Voinko pyytää pakkausapua, varastointia ja lisätä uuden osoitteen?", a: "Kyllä. Tallennetussa raportissa voit pyytää pakkausapua (laajuus ja tarvikkeet), merkitä välivarastoinnin ja syöttää uuden osoitteen kerroksineen, hisseineen ja kantomatkoineen. Kaikki tulee mukaan PDF:ään." },
        ],
      },
      {
        heading: "Ilmainen, PDF ja jakaminen",
        items: [
          { q: "Mikä on ilmaista ja mistä maksan?", a: "Laskuri on kaikille ilmainen: valitse esineet, näe tilavuus ja suositeltu auto. Laskelman tallentaminen, PDF:n lataus ja jaettava linkki kuuluvat maksulliseen laskelmaan (yksi tai kolmen paketti)." },
          { q: "Saanko PDF:n omalla kielelläni?", a: "Kyllä. Valitse PDF:n kieli sivuston 12 kielestä sekä uutta raporttia luodessasi että ladatessasi olemassa olevaa. Kaikki itse kirjoittamasi säilyy – vain kiinteät otsikot ja nimikkeet vaihtuvat." },
          { q: "Miten jaan raportin?", a: "Käytä toimintoa ”Jaa salainen linkki”. Linkin haltija näkee raportin ilman kirjautumista, joten jaa se vain niille, joiden kuuluu nähdä se." },
        ],
      },
      {
        heading: "Muuttofirmoille",
        items: [
          { q: "Miten saamme asiakkaiden pyynnöt?", a: "Kopioi asiakaslinkki tai upotuskoodi hallintapaneelista ja lisää se verkkosivullenne. Kun asiakas lähettää pyynnön, saatte sähköpostin, jossa on tilavuus, esineet, osoitteet kerroksineen, hisseineen, kantomatkoineen ja matkapuhelinnumeroineen, toivottu päivämäärä ja yhteystiedot. Pyyntö näkyy myös hallintapaneelissa tilalla Uusi, Nähty, Tarjous lähetetty, Hyväksytty tai Arkistoitu." },
          { q: "Voimmeko käyttää omaa logoa ja asettaa omat hinnat?", a: "Kyllä. Yritysprofiilissa lisäät logon, brändivärin, yritystiedot sekä hinnan per m³ ja valuutan. Ne näkyvät raportin ja PDF:n yläosassa, ja raportti laskee arvioidun hinnan automaattisesti. Tarjouskilpailutila piilottaa hinnat, kun pyydätte tarjouksia." },
        ],
      },
      {
        heading: "Hinnat ja tietosuoja",
        items: [
          { q: "Paljonko se maksaa?", a: "Laskuri on ilmainen. Yksi laskelma tai kolmen paketti avaa tallennuksen, PDF:n ja jakamisen. Muuttofirmoilla on oma tilauksensa. Katso ajantasaiset hinnat hintasivulta." },
          { q: "Mitä tiedoilleni tapahtuu?", a: "Laskelmasi tallennetaan yksityisesti, eivätkä ne ole koskaan julkisia. Ne poistetaan viimeistään 12 kuukautta viimeisen toiminnan jälkeen. Voit pyytää poistoa milloin tahansa osoitteessa kjell@volumcalc.com." },
        ],
      },
    ],
  },
  de: {
    title: "Hilfe und häufig gestellte Fragen",
    intro: "Alles, was Sie für den Start mit VolumCalc brauchen – von der Checkliste bis zum fertigen Bericht, Teilen und Preisen.",
    ctaTitle: "Keine Antwort gefunden?",
    ctaText: "Schreiben Sie uns ein paar Worte – wir antworten in der Regel innerhalb eines Werktags.",
    cta: "Kostenlose Berechnung starten",
    contact: "Kontakt",
    groups: [
      {
        heading: "Die Checkliste",
        items: [
          { q: "Wie wähle ich Gegenstände aus?", a: "Wählen Sie einen Raum und tippen Sie bei allem, was umzieht, auf +. Die Checkliste enthält über 120 gängige Gegenstände mit Standardmaßen, und Sie können in allen Räumen suchen. Die Summen werden laufend aktualisiert." },
          { q: "Was, wenn mein Gegenstand nicht in der Liste steht?", a: "Fügen Sie einen eigenen Gegenstand mit Name, Länge, Breite und Höhe in cm sowie Anzahl hinzu. Gewicht und Notizen sind optional. Das Volumen wird als Länge × Breite × Höhe × Anzahl berechnet und fließt in die Summen und den Bericht ein." },
          { q: "Was bedeuten „Wird umgezogen“, „Vielleicht“ und „Wird nicht umgezogen“?", a: "Jeder Gegenstand kann auf „Wird umgezogen“, „Vielleicht“ oder „Wird nicht umgezogen“ gesetzt werden. „Wird nicht umgezogen“ zählt nicht zum Volumen. „Vielleicht“ ist in der Summe enthalten, wird aber im Bericht und im PDF hervorgehoben, damit Sie oder die Umzugsfirma darüber entscheiden können." },
        ],
      },
      {
        heading: "Volumen und Fahrzeug",
        items: [
          { q: "Was ist Nettovolumen und was empfohlenes Volumen?", a: "Das Nettovolumen ist die Summe der Gegenstände. Das empfohlene Volumen addiert 25 % Stauzuschlag für Luft zwischen den Möbeln und ist die Zahl, die Sie bei der Wahl von Fahrzeug oder Lagerraum verwenden sollten." },
          { q: "Welches Fahrzeug brauche ich?", a: "Rechner und Bericht zeigen automatisch ein empfohlenes Fahrzeug an, basierend auf dem empfohlenen Volumen (netto plus 25 % Puffer). Sie können es auch in unserem Transporter-Rechner selbst ermitteln." },
        ],
      },
      {
        heading: "Räume, Bearbeitung und Logistik",
        items: [
          { q: "Kann ich eigene Räume hinzufügen?", a: "Ja. Geben Sie im Rechner den Namen eines neuen Raums ein oder richten Sie als Umzugsfirma Ihre Raumliste in den Einstellungen ein." },
          { q: "Kann ich Packhilfe, Lagerung und eine neue Adresse angeben?", a: "Ja. In einem gespeicherten Bericht können Sie Packhilfe anfragen (Umfang und Material), Zwischenlagerung vermerken und die neue Adresse mit Etage, Aufzug und Tragestrecke eintragen. Alles wird ins PDF übernommen." },
        ],
      },
      {
        heading: "Kostenlos, PDF und Teilen",
        items: [
          { q: "Was ist kostenlos und wofür zahle ich?", a: "Der Rechner ist für alle kostenlos: Gegenstände wählen, Volumen und empfohlenes Fahrzeug sehen. Das Speichern der Berechnung, der PDF-Download und der teilbare Link sind in einer bezahlten Berechnung enthalten (einzeln oder 3er-Paket)." },
          { q: "Kann ich das PDF in meiner Sprache erhalten?", a: "Ja. Wählen Sie die PDF-Sprache aus den 12 Sprachen der Website – sowohl beim Erstellen eines neuen Berichts als auch beim Herunterladen eines bestehenden. Alles, was Sie selbst geschrieben haben, bleibt erhalten – nur feste Überschriften und Bezeichnungen wechseln." },
          { q: "Wie teile ich den Bericht?", a: "Verwenden Sie „Geheimen Link teilen“. Wer den Link hat, kann den Bericht ohne Anmeldung ansehen – teilen Sie ihn also nur mit den vorgesehenen Empfängern." },
        ],
      },
      {
        heading: "Für Umzugsfirmen",
        items: [
          { q: "Wie erhalten wir Anfragen von Kunden?", a: "Kopieren Sie den Kundenlink oder den Embed-Code aus dem Dashboard und fügen Sie ihn auf Ihrer Website ein. Wenn ein Kunde absendet, erhalten Sie eine E-Mail mit Volumen, Gegenständen, Adressen mit Etage, Aufzug, Tragestrecke und Mobilnummer, Wunschtermin und Kontaktdaten. Die Anfrage erscheint zudem im Dashboard mit dem Status Neu, Gesehen, Angebot erstellt, Angenommen oder Archiviert." },
          { q: "Können wir unser eigenes Logo und eigene Preise verwenden?", a: "Ja. Im Firmenprofil hinterlegen Sie Logo, Markenfarbe, Firmendaten sowie Preis pro m³ und Währung. Sie erscheinen oben im Bericht und im PDF, und der Bericht berechnet den geschätzten Preis automatisch. Der Ausschreibungsmodus blendet Preise aus, wenn Sie Angebote einholen." },
        ],
      },
      {
        heading: "Preise und Datenschutz",
        items: [
          { q: "Was kostet es?", a: "Der Rechner ist kostenlos. Eine Einzelberechnung oder ein 3er-Paket schaltet Speichern, PDF und Teilen frei. Umzugsfirmen haben ein eigenes Abonnement. Aktuelle Preise finden Sie auf der Preisseite." },
          { q: "Was passiert mit meinen Daten?", a: "Ihre Berechnungen werden privat gespeichert und sind nie öffentlich. Sie werden spätestens 12 Monate nach der letzten Aktivität gelöscht. Eine Löschung können Sie jederzeit unter kjell@volumcalc.com anfordern." },
        ],
      },
    ],
  },
  nl: {
    title: "Hulp en veelgestelde vragen",
    intro: "Alles wat je nodig hebt om met VolumCalc te beginnen – van checklist tot afgewerkt rapport, delen en prijzen.",
    ctaTitle: "Je antwoord niet gevonden?",
    ctaText: "Stuur ons een paar woorden, dan antwoorden we meestal binnen één werkdag.",
    cta: "Start een gratis berekening",
    contact: "Neem contact op",
    groups: [
      {
        heading: "De checklist",
        items: [
          { q: "Hoe kies ik items?", a: "Kies een kamer en tik op + bij alles wat mee verhuist. De checklist bevat meer dan 120 gangbare items met standaardmaten en je kunt in alle kamers zoeken. De totalen worden direct bijgewerkt." },
          { q: "Wat als mijn item niet in de lijst staat?", a: "Voeg een eigen item toe met naam, lengte, breedte en hoogte in cm en een aantal. Gewicht en notities zijn optioneel. Het volume wordt berekend als lengte × breedte × hoogte × aantal en telt mee in de totalen en het rapport." },
          { q: "Wat betekenen Gaat mee, Misschien en Gaat niet mee?", a: "Elk item kan op Gaat mee, Misschien of Gaat niet mee worden gezet. Gaat niet mee telt niet mee in het volume. Misschien zit wel in het totaal, maar wordt in het rapport en de pdf gemarkeerd zodat jij of het verhuisbedrijf erover kunt beslissen." },
        ],
      },
      {
        heading: "Volume en voertuig",
        items: [
          { q: "Wat is nettovolume en wat is aanbevolen volume?", a: "Nettovolume is de som van de items. Het aanbevolen volume telt er 25 % stuwfactor bij voor lucht tussen de meubels op en is het getal dat je gebruikt bij de keuze van voertuig of opslagruimte." },
          { q: "Welk voertuig heb ik nodig?", a: "De calculator en het rapport tonen automatisch een aanbevolen voertuig op basis van het aanbevolen volume (netto plus 25 % buffer). Je kunt het ook zelf uitrekenen in onze verhuiswagencalculator." },
        ],
      },
      {
        heading: "Kamers, bewerken en logistiek",
        items: [
          { q: "Kan ik eigen kamers toevoegen?", a: "Ja. Typ de naam van een nieuwe kamer in de calculator, of stel als verhuisbedrijf je kamerlijst in onder instellingen." },
          { q: "Kan ik inpakhulp, opslag en een nieuw adres opgeven?", a: "Ja. In een opgeslagen rapport kun je inpakhulp aanvragen (omvang en materiaal), tijdelijke opslag noteren en het nieuwe adres met verdieping, lift en draagafstand invullen. Alles gaat mee in de pdf." },
        ],
      },
      {
        heading: "Gratis, pdf en delen",
        items: [
          { q: "Wat is gratis en waarvoor betaal ik?", a: "De calculator is voor iedereen gratis: kies items en zie volume en aanbevolen voertuig. Het opslaan van de berekening, de pdf-download en de deelbare link zitten in een betaalde berekening (enkel of pakket van drie)." },
          { q: "Kan ik de pdf in mijn eigen taal krijgen?", a: "Ja. Kies de pdf-taal uit de 12 talen van de site, zowel bij het maken van een nieuw rapport als bij het downloaden van een bestaand rapport. Alles wat je zelf hebt geschreven blijft behouden – alleen vaste koppen en labels veranderen." },
          { q: "Hoe deel ik het rapport?", a: "Gebruik “Geheime link delen”. Wie de link heeft, kan het rapport zonder in te loggen bekijken, dus deel hem alleen met de bedoelde ontvangers." },
        ],
      },
      {
        heading: "Voor verhuisbedrijven",
        items: [
          { q: "Hoe ontvangen we aanvragen van klanten?", a: "Kopieer de klantlink of de embedcode uit het dashboard en zet die op jullie website. Zodra een klant verstuurt, krijgen jullie een e-mail met volume, items, adressen met verdieping, lift, draagafstand en mobiel nummer, gewenste datum en contactgegevens. De aanvraag staat ook in het dashboard met status Nieuw, Bekeken, Offerte verstuurd, Geaccepteerd of Gearchiveerd." },
          { q: "Kunnen we ons eigen logo en eigen prijzen gebruiken?", a: "Ja. In het bedrijfsprofiel voeg je logo, merkkleur, bedrijfsgegevens en je prijs per m³ en valuta toe. Ze staan bovenaan het rapport en de pdf en het rapport berekent de geschatte prijs automatisch. Aanbestedingsmodus verbergt prijzen wanneer je offertes opvraagt." },
        ],
      },
      {
        heading: "Prijzen en privacy",
        items: [
          { q: "Wat kost het?", a: "De calculator is gratis. Eén berekening of een pakket van drie ontgrendelt opslaan, pdf en delen. Verhuisbedrijven hebben een eigen abonnement. Zie de prijspagina voor actuele prijzen." },
          { q: "Wat gebeurt er met mijn gegevens?", a: "Je berekeningen worden privé opgeslagen en zijn nooit openbaar. Ze worden uiterlijk 12 maanden na de laatste activiteit verwijderd. Je kunt op elk moment om verwijdering vragen via kjell@volumcalc.com." },
        ],
      },
    ],
  },
  fr: {
    title: "Aide et questions fréquentes",
    intro: "Tout ce qu’il faut pour bien démarrer avec VolumCalc – de la liste de contrôle au rapport final, au partage et aux tarifs.",
    ctaTitle: "Vous n’avez pas trouvé la réponse ?",
    ctaText: "Écrivez-nous quelques mots, nous répondons généralement sous un jour ouvré.",
    cta: "Lancer une estimation gratuite",
    contact: "Nous contacter",
    groups: [
      {
        heading: "La liste de contrôle",
        items: [
          { q: "Comment choisir les objets ?", a: "Choisissez une pièce et appuyez sur + pour chaque objet qui déménage. La liste compte plus de 120 objets courants avec leurs dimensions standard, et vous pouvez chercher dans toutes les pièces. Les totaux se mettent à jour en continu." },
          { q: "Et si mon objet n’est pas dans la liste ?", a: "Ajoutez un objet personnalisé avec un nom, la longueur, la largeur et la hauteur en cm, ainsi qu’une quantité. Le poids et les notes sont facultatifs. Le volume est calculé ainsi : longueur × largeur × hauteur × quantité, et il est inclus dans les totaux et le rapport." },
          { q: "Que signifient Déménage, Peut-être et Ne déménage pas ?", a: "Chaque objet peut être réglé sur Déménage, Peut-être ou Ne déménage pas. « Ne déménage pas » n’est pas compté dans le volume. « Peut-être » est inclus dans le total mais mis en évidence dans le rapport et le PDF, pour que vous ou le déménageur puissiez trancher." },
        ],
      },
      {
        heading: "Volume et véhicule",
        items: [
          { q: "Quelle différence entre volume net et volume recommandé ?", a: "Le volume net est la somme des objets. Le volume recommandé ajoute 25 % de coefficient de foisonnement pour l’air entre les meubles ; c’est le chiffre à utiliser pour choisir un véhicule ou un box de stockage." },
          { q: "De quel véhicule ai-je besoin ?", a: "Le calculateur et le rapport affichent automatiquement un véhicule recommandé, d’après le volume recommandé (net plus 25 % de marge). Vous pouvez aussi le calculer vous-même avec notre calculateur de camionnette." },
        ],
      },
      {
        heading: "Pièces, modification et logistique",
        items: [
          { q: "Puis-je ajouter mes propres pièces ?", a: "Oui. Saisissez le nom d’une nouvelle pièce dans le calculateur ou, si vous êtes déménageur, configurez votre liste de pièces dans les paramètres." },
          { q: "Puis-je demander de l’aide à l’emballage, un stockage et indiquer la nouvelle adresse ?", a: "Oui. Dans un rapport enregistré, vous pouvez demander de l’aide à l’emballage (étendue et matériel), noter un stockage intermédiaire et saisir la nouvelle adresse avec étage, ascenseur et distance de portage. Tout figure dans le PDF." },
        ],
      },
      {
        heading: "Gratuit, PDF et partage",
        items: [
          { q: "Qu’est-ce qui est gratuit et que dois-je payer ?", a: "Le calculateur est gratuit pour tous : choisissez les objets, voyez le volume et le véhicule recommandé. L’enregistrement de l’estimation, le téléchargement du PDF et le lien partageable sont inclus dans une estimation payante (à l’unité ou pack de trois)." },
          { q: "Puis-je obtenir le PDF dans ma langue ?", a: "Oui. Choisissez la langue du PDF parmi les 12 langues du site, aussi bien pour un nouveau rapport que pour le téléchargement d’un rapport existant. Tout ce que vous avez écrit est conservé – seuls les titres et libellés fixes changent." },
          { q: "Comment partager le rapport ?", a: "Utilisez « Partager le lien secret ». Toute personne disposant du lien peut consulter le rapport sans se connecter ; ne le partagez donc qu’avec les destinataires voulus." },
        ],
      },
      {
        heading: "Pour les déménageurs",
        items: [
          { q: "Comment recevons-nous les demandes des clients ?", a: "Copiez le lien client ou le code d’intégration depuis le tableau de bord et placez-le sur votre site. Lorsqu’un client envoie sa demande, vous recevez un e-mail avec le volume, les objets, les adresses (étage, ascenseur, distance de portage et mobile), la date souhaitée et les coordonnées. La demande apparaît aussi dans le tableau de bord avec le statut Nouveau, Vu, Devis envoyé, Accepté ou Archivé." },
          { q: "Pouvons-nous utiliser notre logo et nos propres prix ?", a: "Oui. Dans le profil de l’entreprise, vous ajoutez logo, couleur de marque, informations légales, prix au m³ et devise. Ils figurent en haut du rapport et du PDF, et le rapport calcule automatiquement le prix estimé. Le mode appel d’offres masque les prix lorsque vous sollicitez des devis." },
        ],
      },
      {
        heading: "Tarifs et confidentialité",
        items: [
          { q: "Combien ça coûte ?", a: "Le calculateur est gratuit. Une estimation ou un pack de trois débloque l’enregistrement, le PDF et le partage. Les déménageurs ont leur propre abonnement. Consultez la page des tarifs pour les prix actuels." },
          { q: "Que deviennent mes données ?", a: "Vos estimations sont stockées de façon privée et ne sont jamais publiques. Elles sont supprimées au plus tard 12 mois après la dernière activité. Vous pouvez demander la suppression à tout moment à kjell@volumcalc.com." },
        ],
      },
    ],
  },
  pl: {
    title: "Pomoc i najczęściej zadawane pytania",
    intro: "Wszystko, czego potrzebujesz, by zacząć z VolumCalc – od listy kontrolnej po gotowy raport, udostępnianie i ceny.",
    ctaTitle: "Nie znalazłeś odpowiedzi?",
    ctaText: "Napisz do nas kilka słów – zwykle odpowiadamy w ciągu jednego dnia roboczego.",
    cta: "Rozpocznij darmowe wyliczenie",
    contact: "Skontaktuj się z nami",
    groups: [
      {
        heading: "Lista kontrolna",
        items: [
          { q: "Jak wybieram przedmioty?", a: "Wybierz pomieszczenie i dotknij + przy wszystkim, co jedzie. Lista zawiera ponad 120 typowych przedmiotów ze standardowymi wymiarami, a wyszukiwać możesz we wszystkich pomieszczeniach. Sumy aktualizują się na bieżąco." },
          { q: "Co jeśli mojego przedmiotu nie ma na liście?", a: "Dodaj własny przedmiot z nazwą, długością, szerokością i wysokością w cm oraz ilością. Waga i notatki są opcjonalne. Objętość to długość × szerokość × wysokość × ilość i jest wliczana do sum oraz raportu." },
          { q: "Co oznaczają Jedzie, Może i Nie jedzie?", a: "Każdy przedmiot można ustawić na Jedzie, Może lub Nie jedzie. „Nie jedzie” nie wlicza się do objętości. „Może” jest wliczone do sumy, ale wyróżnione w raporcie i PDF, aby Ty lub firma przeprowadzkowa mogli o nim zdecydować." },
        ],
      },
      {
        heading: "Objętość i pojazd",
        items: [
          { q: "Czym różni się objętość netto od zalecanej?", a: "Objętość netto to suma przedmiotów. Objętość zalecana dodaje 25 % zapasu na powietrze między meblami i to ją warto brać pod uwagę przy wyborze pojazdu lub boksu magazynowego." },
          { q: "Jakiego pojazdu potrzebuję?", a: "Kalkulator i raport automatycznie pokazują zalecany pojazd na podstawie zalecanej objętości (netto plus 25 % zapasu). Możesz też sprawdzić to sam w naszym kalkulatorze samochodu przeprowadzkowego." },
        ],
      },
      {
        heading: "Pomieszczenia, edycja i logistyka",
        items: [
          { q: "Czy mogę dodać własne pomieszczenia?", a: "Tak. Wpisz nazwę nowego pomieszczenia w kalkulatorze albo – jeśli prowadzisz firmę przeprowadzkową – skonfiguruj listę pomieszczeń w ustawieniach." },
          { q: "Czy mogę poprosić o pomoc w pakowaniu, magazynowanie i podać nowy adres?", a: "Tak. W zapisanym raporcie możesz poprosić o pomoc w pakowaniu (zakres i materiały), odnotować magazynowanie pośrednie i wpisać nowy adres z piętrem, windą i odległością noszenia. Wszystko trafia do PDF." },
        ],
      },
      {
        heading: "Za darmo, PDF i udostępnianie",
        items: [
          { q: "Co jest za darmo, a za co płacę?", a: "Kalkulator jest darmowy dla wszystkich: wybierasz przedmioty i widzisz objętość oraz zalecany pojazd. Zapisanie wyliczenia, pobranie PDF i link do udostępniania wchodzą w skład płatnego wyliczenia (pojedynczego lub pakietu trzech)." },
          { q: "Czy mogę dostać PDF w swoim języku?", a: "Tak. Wybierz język PDF spośród 12 języków serwisu – zarówno przy tworzeniu nowego raportu, jak i przy pobieraniu istniejącego. Wszystko, co sam wpisałeś, pozostaje bez zmian – zmieniają się tylko stałe nagłówki i etykiety." },
          { q: "Jak udostępnić raport?", a: "Użyj opcji „Udostępnij tajny link”. Każdy, kto ma link, zobaczy raport bez logowania, więc udostępniaj go tylko właściwym osobom." },
        ],
      },
      {
        heading: "Dla firm przeprowadzkowych",
        items: [
          { q: "Jak otrzymujemy zapytania od klientów?", a: "Skopiuj link dla klientów lub kod osadzenia z panelu i umieść na swojej stronie. Gdy klient wyśle zapytanie, dostaniecie e-mail z objętością, przedmiotami, adresami z piętrem, windą, odległością noszenia i numerem komórkowym, preferowaną datą i danymi kontaktowymi. Zapytanie trafia też do panelu ze statusem Nowe, Obejrzane, Wycena wysłana, Zaakceptowane lub Zarchiwizowane." },
          { q: "Czy możemy używać własnego logo i ustalać własne ceny?", a: "Tak. W profilu firmy dodajesz logo, kolor marki, dane firmy oraz cenę za m³ i walutę. Pojawiają się na górze raportu i PDF, a raport automatycznie liczy szacunkową cenę. Tryb przetargowy ukrywa ceny, gdy zbierasz oferty." },
        ],
      },
      {
        heading: "Ceny i prywatność",
        items: [
          { q: "Ile to kosztuje?", a: "Kalkulator jest darmowy. Pojedyncze wyliczenie lub pakiet trzech odblokowuje zapisywanie, PDF i udostępnianie. Firmy przeprowadzkowe mają własny abonament. Aktualne ceny znajdziesz na stronie cennika." },
          { q: "Co dzieje się z moimi danymi?", a: "Twoje wyliczenia są przechowywane prywatnie i nigdy nie są publiczne. Usuwamy je najpóźniej 12 miesięcy po ostatniej aktywności. O usunięcie możesz poprosić w każdej chwili pod adresem kjell@volumcalc.com." },
        ],
      },
    ],
  },
  es: {
    title: "Ayuda y preguntas frecuentes",
    intro: "Todo lo que necesitas para empezar con VolumCalc: de la lista al informe final, para compartir y los precios.",
    ctaTitle: "¿No encontraste tu respuesta?",
    ctaText: "Escríbenos unas líneas y normalmente respondemos en un día laborable.",
    cta: "Empezar una estimación gratuita",
    contact: "Contáctanos",
    groups: [
      {
        heading: "La lista de verificación",
        items: [
          { q: "¿Cómo elijo los objetos?", a: "Elige una habitación y pulsa + en todo lo que se mueve. La lista tiene más de 120 objetos habituales con medidas estándar y puedes buscar en todas las habitaciones. Los totales se actualizan al instante." },
          { q: "¿Y si mi objeto no está en la lista?", a: "Añade un objeto propio con nombre, largo, ancho y alto en cm y una cantidad. El peso y las notas son opcionales. El volumen se calcula como largo × ancho × alto × cantidad y se incluye en los totales y el informe." },
          { q: "¿Qué significan Se mueve, Quizás y No se mueve?", a: "Cada objeto puede marcarse como Se mueve, Quizás o No se mueve. «No se mueve» no cuenta en el volumen. «Quizás» entra en el total, pero se resalta en el informe y el PDF para que tú o la empresa de mudanzas lo decidáis." },
        ],
      },
      {
        heading: "Volumen y vehículo",
        items: [
          { q: "¿Qué es el volumen neto y el recomendado?", a: "El volumen neto es la suma de los objetos. El recomendado añade un 25 % de factor de estiba por el aire entre los muebles y es la cifra que debes usar al elegir vehículo o trastero." },
          { q: "¿Qué vehículo necesito?", a: "La calculadora y el informe muestran automáticamente un vehículo recomendado según el volumen recomendado (neto más un 25 % de margen). También puedes calcularlo tú en nuestra calculadora de furgonetas." },
        ],
      },
      {
        heading: "Habitaciones, edición y logística",
        items: [
          { q: "¿Puedo añadir mis propias habitaciones?", a: "Sí. Escribe el nombre de una habitación nueva en la calculadora o, si eres una empresa de mudanzas, configura tu lista de habitaciones en los ajustes." },
          { q: "¿Puedo pedir ayuda de embalaje, guardamuebles e indicar la nueva dirección?", a: "Sí. En un informe guardado puedes solicitar ayuda de embalaje (alcance y materiales), anotar un almacenamiento intermedio e indicar la nueva dirección con planta, ascensor y distancia de acarreo. Todo pasa al PDF." },
        ],
      },
      {
        heading: "Gratis, PDF y compartir",
        items: [
          { q: "¿Qué es gratis y por qué pago?", a: "La calculadora es gratuita para todos: elige objetos y consulta el volumen y el vehículo recomendado. Guardar la estimación, descargar el PDF y obtener un enlace para compartir se incluyen con una estimación de pago (individual o pack de tres)." },
          { q: "¿Puedo obtener el PDF en mi idioma?", a: "Sí. Elige el idioma del PDF entre los 12 del sitio, tanto al crear un informe nuevo como al descargar uno existente. Todo lo que has escrito se conserva; solo cambian los títulos y etiquetas fijos." },
          { q: "¿Cómo comparto el informe?", a: "Usa «Compartir enlace secreto». Quien tenga el enlace puede ver el informe sin iniciar sesión, así que compártelo solo con los destinatarios previstos." },
        ],
      },
      {
        heading: "Para empresas de mudanzas",
        items: [
          { q: "¿Cómo recibimos las solicitudes de los clientes?", a: "Copia el enlace para clientes o el código para insertar desde el panel y colócalo en vuestra web. Cuando un cliente envía, recibís un correo con el volumen, los objetos, las direcciones con planta, ascensor, distancia de acarreo y móvil, la fecha preferida y los datos de contacto. La solicitud también aparece en el panel con estado Nueva, Vista, Presupuestada, Aceptada o Archivada." },
          { q: "¿Podemos usar nuestro logotipo y nuestros precios?", a: "Sí. En el perfil de empresa añades logotipo, color de marca, datos de la empresa, precio por m³ y moneda. Aparecen en la parte superior del informe y del PDF, y el informe calcula automáticamente el precio estimado. El modo licitación oculta los precios cuando pedís ofertas." },
        ],
      },
      {
        heading: "Precios y privacidad",
        items: [
          { q: "¿Cuánto cuesta?", a: "La calculadora es gratuita. Una estimación o un pack de tres desbloquea guardar, PDF y compartir. Las empresas de mudanzas tienen su propia suscripción. Consulta la página de precios." },
          { q: "¿Qué pasa con mis datos?", a: "Tus estimaciones se guardan de forma privada y nunca son públicas. Se eliminan como máximo 12 meses después de la última actividad. Puedes pedir su eliminación en cualquier momento en kjell@volumcalc.com." },
        ],
      },
    ],
  },
  it: {
    title: "Aiuto e domande frequenti",
    intro: "Tutto ciò che serve per iniziare con VolumCalc: dalla lista al rapporto finale, alla condivisione e ai prezzi.",
    ctaTitle: "Non hai trovato la risposta?",
    ctaText: "Scrivici qualche riga: di solito rispondiamo entro un giorno lavorativo.",
    cta: "Avvia una stima gratuita",
    contact: "Contattaci",
    groups: [
      {
        heading: "La lista di controllo",
        items: [
          { q: "Come scelgo gli oggetti?", a: "Scegli una stanza e tocca + su ciò che viene spostato. La lista contiene oltre 120 oggetti comuni con misure standard e puoi cercare in tutte le stanze. I totali si aggiornano subito." },
          { q: "E se il mio oggetto non è nella lista?", a: "Aggiungi un oggetto personalizzato con nome, lunghezza, larghezza e altezza in cm e una quantità. Peso e note sono facoltativi. Il volume è calcolato come lunghezza × larghezza × altezza × quantità ed è incluso nei totali e nel rapporto." },
          { q: "Cosa significano Si sposta, Forse e Non si sposta?", a: "Ogni oggetto può essere impostato su Si sposta, Forse o Non si sposta. «Non si sposta» non rientra nel volume. «Forse» è incluso nel totale ma evidenziato nel rapporto e nel PDF, così tu o l’azienda potete decidere." },
        ],
      },
      {
        heading: "Volume e veicolo",
        items: [
          { q: "Cos’è il volume netto rispetto a quello consigliato?", a: "Il volume netto è la somma degli oggetti. Il volume consigliato aggiunge il 25 % di fattore di stivaggio per l’aria tra i mobili ed è il valore da usare per scegliere veicolo o box." },
          { q: "Di che veicolo ho bisogno?", a: "Il calcolatore e il rapporto mostrano automaticamente un veicolo consigliato in base al volume consigliato (netto più 25 % di margine). Puoi anche calcolarlo da solo con il nostro calcolatore di furgoni." },
        ],
      },
      {
        heading: "Stanze, modifiche e logistica",
        items: [
          { q: "Posso aggiungere stanze mie?", a: "Sì. Scrivi il nome di una nuova stanza nel calcolatore oppure, se sei un’azienda di traslochi, imposta l’elenco delle stanze nelle impostazioni." },
          { q: "Posso chiedere aiuto per l’imballaggio, deposito e indicare il nuovo indirizzo?", a: "Sì. In un rapporto salvato puoi richiedere aiuto per l’imballaggio (entità e materiali), annotare un deposito intermedio e inserire il nuovo indirizzo con piano, ascensore e distanza di trasporto. Tutto finisce nel PDF." },
        ],
      },
      {
        heading: "Gratis, PDF e condivisione",
        items: [
          { q: "Cosa è gratis e cosa pago?", a: "Il calcolatore è gratuito per tutti: scegli gli oggetti e vedi volume e veicolo consigliato. Salvare la stima, scaricare il PDF e ottenere un link condivisibile sono inclusi in una stima a pagamento (singola o pacchetto da tre)." },
          { q: "Posso avere il PDF nella mia lingua?", a: "Sì. Scegli la lingua del PDF tra le 12 del sito, sia creando un nuovo rapporto sia scaricandone uno esistente. Tutto ciò che hai scritto resta invariato: cambiano solo titoli ed etichette fissi." },
          { q: "Come condivido il rapporto?", a: "Usa «Condividi link segreto». Chiunque abbia il link può vedere il rapporto senza accedere, quindi condividilo solo con i destinatari previsti." },
        ],
      },
      {
        heading: "Per le aziende di traslochi",
        items: [
          { q: "Come riceviamo le richieste dei clienti?", a: "Copia il link per i clienti o il codice di incorporamento dalla dashboard e inseriscilo nel vostro sito. Quando un cliente invia, ricevete un’e-mail con volume, oggetti, indirizzi con piano, ascensore, distanza di trasporto e cellulare, data preferita e recapiti. La richiesta compare anche nella dashboard con stato Nuova, Vista, Preventivata, Accettata o Archiviata." },
          { q: "Possiamo usare il nostro logo e i nostri prezzi?", a: "Sì. Nel profilo aziendale inserisci logo, colore del marchio, dati aziendali, prezzo al m³ e valuta. Compaiono in alto nel rapporto e nel PDF e il rapporto calcola automaticamente il prezzo stimato. La modalità gara nasconde i prezzi quando chiedete offerte." },
        ],
      },
      {
        heading: "Prezzi e privacy",
        items: [
          { q: "Quanto costa?", a: "Il calcolatore è gratuito. Una stima o un pacchetto da tre sblocca salvataggio, PDF e condivisione. Le aziende di traslochi hanno un abbonamento dedicato. Consulta la pagina dei prezzi." },
          { q: "Che fine fanno i miei dati?", a: "Le tue stime sono archiviate in modo privato e non sono mai pubbliche. Vengono eliminate al più tardi 12 mesi dopo l’ultima attività. Puoi chiedere l’eliminazione in qualsiasi momento a kjell@volumcalc.com." },
        ],
      },
    ],
  },
  pt: {
    title: "Ajuda e perguntas frequentes",
    intro: "Tudo o que precisa para começar com o VolumCalc: da lista ao relatório final, partilha e preços.",
    ctaTitle: "Não encontrou a resposta?",
    ctaText: "Escreva-nos algumas linhas e respondemos normalmente num dia útil.",
    cta: "Iniciar uma estimativa gratuita",
    contact: "Contacte-nos",
    groups: [
      {
        heading: "A lista de verificação",
        items: [
          { q: "Como escolho os objetos?", a: "Escolha uma divisão e toque em + em tudo o que vai na mudança. A lista tem mais de 120 objetos comuns com medidas padrão e pode pesquisar em todas as divisões. Os totais atualizam-se de imediato." },
          { q: "E se o meu objeto não estiver na lista?", a: "Adicione um objeto próprio com nome, comprimento, largura e altura em cm e uma quantidade. O peso e as notas são opcionais. O volume é calculado como comprimento × largura × altura × quantidade e entra nos totais e no relatório." },
          { q: "O que significam Vai, Talvez e Não vai?", a: "Cada objeto pode ficar como Vai, Talvez ou Não vai. «Não vai» não conta para o volume. «Talvez» entra no total, mas é destacado no relatório e no PDF para que você ou a empresa de mudanças decidam." },
        ],
      },
      {
        heading: "Volume e veículo",
        items: [
          { q: "O que é volume líquido e volume recomendado?", a: "O volume líquido é a soma dos objetos. O recomendado acrescenta 25 % de fator de estiva para o ar entre os móveis e é o valor a usar ao escolher veículo ou arrecadação." },
          { q: "Que veículo preciso?", a: "A calculadora e o relatório mostram automaticamente um veículo recomendado, com base no volume recomendado (líquido mais 25 % de margem). Também pode calcular na nossa calculadora de carrinhas." },
        ],
      },
      {
        heading: "Divisões, edição e logística",
        items: [
          { q: "Posso adicionar as minhas divisões?", a: "Sim. Escreva o nome de uma nova divisão na calculadora ou, se for uma empresa de mudanças, configure a lista de divisões nas definições." },
          { q: "Posso pedir ajuda de embalagem, armazenamento e indicar a nova morada?", a: "Sim. Num relatório guardado pode pedir ajuda de embalagem (âmbito e materiais), anotar armazenamento intermédio e indicar a nova morada com andar, elevador e distância de transporte. Tudo segue no PDF." },
        ],
      },
      {
        heading: "Grátis, PDF e partilha",
        items: [
          { q: "O que é grátis e o que pago?", a: "A calculadora é gratuita para todos: escolha objetos e veja o volume e o veículo recomendado. Guardar a estimativa, descarregar o PDF e obter uma ligação partilhável estão incluídos numa estimativa paga (individual ou pacote de três)." },
          { q: "Posso obter o PDF no meu idioma?", a: "Sim. Escolha o idioma do PDF entre os 12 do site, tanto ao criar um relatório novo como ao descarregar um existente. Tudo o que escreveu mantém-se — só os títulos e rótulos fixos mudam." },
          { q: "Como partilho o relatório?", a: "Use «Partilhar ligação secreta». Quem tiver a ligação vê o relatório sem iniciar sessão, por isso partilhe-a apenas com os destinatários pretendidos." },
        ],
      },
      {
        heading: "Para empresas de mudanças",
        items: [
          { q: "Como recebemos os pedidos dos clientes?", a: "Copie a ligação para clientes ou o código de incorporação do painel e coloque-os no seu site. Quando um cliente submete, recebe um e-mail com volume, objetos, moradas com andar, elevador, distância de transporte e telemóvel, data preferida e contactos. O pedido aparece também no painel com o estado Novo, Visto, Orçamentado, Aceite ou Arquivado." },
          { q: "Podemos usar o nosso logótipo e os nossos preços?", a: "Sim. No perfil da empresa adiciona logótipo, cor da marca, dados da empresa, preço por m³ e moeda. Aparecem no topo do relatório e do PDF e o relatório calcula automaticamente o preço estimado. O modo concurso oculta os preços quando pede propostas." },
        ],
      },
      {
        heading: "Preços e privacidade",
        items: [
          { q: "Quanto custa?", a: "A calculadora é gratuita. Uma estimativa ou um pacote de três desbloqueia guardar, PDF e partilha. As empresas de mudanças têm subscrição própria. Veja a página de preços." },
          { q: "O que acontece aos meus dados?", a: "As suas estimativas são guardadas de forma privada e nunca são públicas. São eliminadas, o mais tardar, 12 meses após a última atividade. Pode pedir a eliminação a qualquer momento em kjell@volumcalc.com." },
        ],
      },
    ],
  },
};
