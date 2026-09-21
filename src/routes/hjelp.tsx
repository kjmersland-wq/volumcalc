import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useI18n, type Lang } from "@/lib/i18n";
import { useLocalizedMeta } from "@/lib/use-localized-meta";

type Faq = { q: string; a: string };
type Group = { heading: string; items: Faq[] };

const content: Record<
  Lang,
  {
    title: string;
    intro: string;
    groups: Group[];
    ctaTitle: string;
    ctaText: string;
    cta: string;
    contact: string;
  }
> = {
  no: {
    title: "Hjelp og ofte stilte spørsmål",
    intro:
      "Alt du trenger for å komme i gang med VolumCalc – fra romvideo og rolig sjekkliste til ferdig rapport, pakking, lagring og deling.",
    ctaTitle: "Fant du ikke svaret?",
    ctaText: "Send oss noen ord, så svarer vi vanligvis innen én virkedag.",
    cta: "Start en gratis beregning",
    contact: "Kontakt oss",
    groups: [
      {
        heading: "Romvideo",
        items: [
          {
            q: "Hvor lenge bør jeg filme hvert rom?",
            a: "Ta en rolig runde gjennom rommet i ditt eget tempo, slik at de viktigste møblene kommer tydelig med. Du trenger ikke nærbilder av hver minste ting, siden du bekrefter innholdet i sjekklisten etterpå.",
          },
          {
            q: "Hva gir best resultat?",
            a: "Godt lys, ryddige flater og en jevn kamerarunde fra døråpningen, slik at hele rommet kommer med. Hold mobilen stødig og ta den tiden du trenger.",
          },
          {
            q: "Må jeg filme inni skap og skuffer?",
            a: "Nei. Innholdet regnes vanligvis som flyttekasser, så du kan heller bekrefte antall i sjekklisten etter at du er ferdig med videoen.",
          },
        ],
      },
      {
        heading: "Rom og redigering",
        items: [
          {
            q: "Hvordan havner tingene i riktig rom?",
            a: "Du velger rommet før du filmer, og går deretter gjennom en sjekkliste som er tilpasset akkurat det rommet.",
          },
          {
            q: "Kan jeg endre navn på rom og flytte ting?",
            a: "Ja. I rapporten kan du gi rom nytt navn, flytte en gjenstand til et annet rom, endre antall og mål, legge til merknader og merke ting som skjøre, tunge, til demontering eller som ikke skal være med.",
          },
          {
            q: "Hva om noe mangler eller blir feil?",
            a: "Ingen fare — juster antall direkte i sjekklisten. Totalene oppdateres med én gang, så du får ryddet opp på et øyeblikk.",
          },
        ],
      },
      {
        heading: "Volum og bil",
        items: [
          {
            q: "Hva betyr nettovolum og anbefalt volum?",
            a: "Nettovolum er summen av gjenstandene. Anbefalt volum legger på 25 % stuefaktor for luft mellom møblene, og er tallet du bør bruke når du velger bil eller lagerrom.",
          },
          {
            q: "Hvilken bil trenger jeg?",
            a: "Rapporten foreslår bilstørrelse ut fra anbefalt volum. Du kan også regne på det selv i flyttebil-kalkulatoren vår.",
          },
        ],
      },
      {
        heading: "Pakking, lagring og levering",
        items: [
          {
            q: "Kan jeg be om hjelp til pakking?",
            a: "Ja. I rapporten krysser du av for pakkehjelp, velger omfang (kun skjøre ting, delvis eller full pakking) og fyller inn hvor mye emballasje som trengs – kasser, bobleplast, pakkepapir, tape, garderobekasser, madrassposer og møbeltepper.",
          },
          {
            q: "Vi skal mellomlagre tingene. Hvordan noterer jeg det?",
            a: "Fyll ut feltet for mellomlagring med lagerhotellets firmanavn, full adresse og kontaktperson. Det følger med i rapporten og PDF-en.",
          },
          {
            q: "Hvor legger jeg inn ny adresse?",
            a: "Under levering til ny bopel: full adresse, etasje, om det er heis, bæreavstand og eventuelle merknader.",
          },
        ],
      },
      {
        heading: "Deling, språk og PDF",
        items: [
          {
            q: "Kan jeg lagre rapporten på flere språk?",
            a: "Ja. Velg rapportspråket som passer deg best. Alt du har redigert selv beholdes – det er kun de faste tekstene som byttes. Deretter kan du dele lenken eller lagre PDF på det språket.",
          },
          {
            q: "Hvordan deler jeg rapporten?",
            a: "Bruk «Del hemmelig lenke». Den som har lenken ser rapporten uten å logge inn, så del den bare med dem som skal se den.",
          },
          {
            q: "Hvordan skjuler jeg prisen når jeg sender ut på anbud?",
            a: "Slå på anbudsmodus i rapporten. Da forsvinner estimert pris og all priskalkyle fra skjerm, PDF og delt lenke, slik at transportfirmaene kun ser volum og innhold.",
          },
        ],
      },
      {
        heading: "For flyttebyråer",
        items: [
          {
            q: "Kan vi bruke vår egen logo og firmadetaljer?",
            a: "Ja. Under firmaprofil legger du inn logo, merkefarge, firmanavn, organisasjonsnummer, adresse, telefon, e-post og nettside. Det vises øverst i rapporten, i PDF-en og i headeren når dere er innlogget.",
          },
          {
            q: "Hvordan setter vi pris?",
            a: "Legg inn pris per m³ og valuta i firmaprofilen. Rapporten regner ut estimert pris automatisk, og i bedriftsvisningen kan dere også regne på timepris.",
          },
        ],
      },
      {
        heading: "Priser og personvern",
        items: [
          {
            q: "Hva koster det?",
            a: "Privatpersoner kan prøve gratis, og kjøpe én beregning eller en pakke med tre. Flyttebyråer har eget abonnement. Se prissiden for gjeldende priser.",
          },
          {
            q: "Hva skjer med bildene mine?",
            a: "Romvideoen din oppbevares privat i et lukket lager og brukes ikke til å trene AI-modeller. Den slettes senest 12 måneder etter siste aktivitet, og du kan når som helst be om raskere sletting på kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  en: {
    title: "Help and frequently asked questions",
    intro:
      "Everything you need to get started with VolumCalc — from a quick room video and a calm checklist to a polished report, packing, storage and sharing.",
    ctaTitle: "Didn't find your answer?",
    ctaText: "Send us a few words and we usually reply within one business day.",
    cta: "Start a free estimate",
    contact: "Contact us",
    groups: [
      {
        heading: "Recording your room video",
        items: [
          {
            q: "How long should each room video be?",
            a: "A gentle sweep of each room at your own pace is usually perfect, so the main furniture is clearly visible. No need for close-ups of every little thing, as you’ll confirm items in the checklist afterwards.",
          },
          {
            q: "What gives the best result?",
            a: "Good lighting, tidy surfaces, and a smooth pan from the doorway so the full room is in view. Keep your phone steady and take your time.",
          },
          {
            q: "Do I need to record inside cupboards and drawers?",
            a: "No, not at all. Cupboard contents are normally counted as boxes, so you can simply confirm quantities in the checklist after filming.",
          },
        ],
      },
      {
        heading: "Rooms and editing",
        items: [
          {
            q: "How are items assigned to rooms?",
            a: "You choose the room before filming, then confirm items in a checklist tailored to that exact room.",
          },
          {
            q: "Can I rename rooms and move items?",
            a: "Yes. In the report you can rename rooms, move an item to another room, change quantity and dimensions, add notes and flag items as fragile, heavy, needing disassembly or not moving at all.",
          },
          {
            q: "What if something is missing or wrong?",
            a: "No worries — just adjust quantities directly in the checklist. Totals update instantly, so you can tidy everything up in moments.",
          },
        ],
      },
      {
        heading: "Volume and vehicle",
        items: [
          {
            q: "What is net volume versus recommended volume?",
            a: "Net volume is the sum of the items. Recommended volume adds a 25% stowage factor for air between furniture, and is the figure to use when choosing a vehicle or storage unit.",
          },
          {
            q: "Which van or truck do I need?",
            a: "The report suggests a vehicle size from the recommended volume. You can also work it out in our moving van calculator.",
          },
        ],
      },
      {
        heading: "Packing, storage and delivery",
        items: [
          {
            q: "Can I ask for packing help?",
            a: "Yes. Tick packing help in the report, choose the scope (fragile only, partial or full packing) and enter how much material is needed — boxes, bubble wrap, packing paper, tape, wardrobe boxes, mattress bags and furniture blankets.",
          },
          {
            q: "We need interim storage. Where do I note that?",
            a: "Fill in the storage section with the facility's company name, full address and contact person. It is carried into the report and the PDF.",
          },
          {
            q: "Where do I add the new address?",
            a: "Under delivery to the new home: full address, floor, whether there is a lift, carrying distance and any notes.",
          },
        ],
      },
      {
        heading: "Sharing, language and PDF",
        items: [
          {
            q: "Can I save the report in several languages?",
            a: "Yes. Choose the report language that suits you best. Everything you edited yourself is kept — only the fixed labels change. Then share the link or save the PDF in that language.",
          },
          {
            q: "How do I share the report?",
            a: "Use \u201cShare secret link\u201d. Anyone with the link can view the report without signing in, so only share it with the intended recipients.",
          },
          {
            q: "How do I hide prices when inviting tenders?",
            a: "Turn on tender mode in the report. The estimated price and all price calculations disappear from the screen, the PDF and the shared link, so carriers only see volume and contents.",
          },
        ],
      },
      {
        heading: "For moving companies",
        items: [
          {
            q: "Can we use our own logo and company details?",
            a: "Yes. In the company profile you add logo, brand colour, company name, registration number, address, phone, email and website. They appear at the top of the report, in the PDF and in the header when you are signed in.",
          },
          {
            q: "How do we set prices?",
            a: "Enter your rate per m³ and currency in the company profile. The report calculates the estimated price automatically, and the business view also lets you work with an hourly rate.",
          },
        ],
      },
      {
        heading: "Pricing and privacy",
        items: [
          {
            q: "What does it cost?",
            a: "Private individuals can try it free and buy a single estimate or a pack of three. Moving companies have their own subscription. See the pricing page for current prices.",
          },
          {
            q: "What happens to my room video?",
            a: "Your estimate is created from your room video and checklist flow. Your media stays private, is not used to train AI models, and is deleted no later than 12 months after the last activity. If you’d like deletion sooner, just drop us a line at kjell@volumcalc.com and we’ll gladly help.",
          },
        ],
      },
    ],
  },
  sv: {
    title: "Hjälp och vanliga frågor",
    intro:
      "Allt du behöver för att komma igång med VolumCalc – från rumsvideo och lugn checklista till färdig rapport, packning, förvaring och delning.",
    ctaTitle: "Hittade du inte svaret?",
    ctaText: "Skicka några ord till oss, så svarar vi oftast inom en arbetsdag.",
    cta: "Starta en gratis uppskattning",
    contact: "Kontakta oss",
    groups: [
      {
        heading: "Rumsvideo",
        items: [
          {
            q: "Hur länge bör jag filma varje rum?",
            a: "Gå lugnt igenom rummet i ditt eget tempo så att de viktigaste möblerna syns tydligt. Du behöver inte närbilder av allt, eftersom du bekräftar innehållet i checklistan efteråt.",
          },
          {
            q: "Vad ger bäst resultat?",
            a: "Bra ljus, fria ytor och en jämn videorunda från dörröppningen så att hela rummet kommer med. Håll mobilen stadigt och ta den tid du behöver.",
          },
          {
            q: "Måste jag filma inne i skåp och lådor?",
            a: "Nej. Innehållet räknas oftast som flyttkartonger, så du kan i stället bekräfta antalet i checklistan när videon är klar.",
          },
        ],
      },
      {
        heading: "Rum och redigering",
        items: [
          {
            q: "Hur hamnar saker i rätt rum?",
            a: "Du väljer rum innan du filmar och går sedan igenom en checklista som passar just det rummet.",
          },
          {
            q: "Kan jag byta namn på rum och flytta saker?",
            a: "Ja. I rapporten kan du byta namn på rum, flytta en sak till ett annat rum, ändra antal och mått, lägga till anteckningar och markera ömtåligt, tungt, demontering eller sådant som inte ska med.",
          },
          {
            q: "Vad händer om något saknas eller blir fel?",
            a: "Ingen fara — justera bara antalet direkt i checklistan. Totalerna uppdateras direkt.",
          },
        ],
      },
      {
        heading: "Volym och fordon",
        items: [
          {
            q: "Vad är nettovolym och rekommenderad volym?",
            a: "Nettovolym är summan av sakerna. Rekommenderad volym lägger till 25 % luft mellan möblerna och är siffran du bör använda för bil eller förråd.",
          },
          {
            q: "Vilken bil behöver jag?",
            a: "Rapporten föreslår fordonsstorlek utifrån rekommenderad volym. Du kan också räkna själv i vår flyttbilskalkylator.",
          },
        ],
      },
      {
        heading: "Packning, förvaring och leverans",
        items: [
          {
            q: "Kan jag be om hjälp med packning?",
            a: "Ja. I rapporten markerar du packhjälp, väljer omfattning och fyller i material som behövs, som kartonger, bubbelplast, packpapper, tejp, garderobskartonger, madrasspåsar och möbelfiltar.",
          },
          {
            q: "Vi behöver mellanlagring. Var skriver jag det?",
            a: "Fyll i förvaringsdelen med företagets namn, full adress och kontaktperson. Det följer med i rapporten och PDF:en.",
          },
          {
            q: "Var lägger jag in den nya adressen?",
            a: "Under leverans till ny bostad: full adress, våning, hiss, bäravstånd och eventuella anteckningar.",
          },
        ],
      },
      {
        heading: "Delning, språk och PDF",
        items: [
          {
            q: "Kan jag spara rapporten på flera språk?",
            a: "Ja. Välj det rapportspråk som passar bäst. Allt du själv har redigerat behålls — bara de fasta texterna byts ut.",
          },
          {
            q: "Hur delar jag rapporten?",
            a: "Använd ”Dela hemlig länk”. Alla med länken kan se rapporten utan att logga in, så dela den bara med rätt personer.",
          },
          {
            q: "Hur döljer jag priset när jag skickar ut anbud?",
            a: "Slå på anbudsläge i rapporten. Då döljs uppskattat pris och priskalkyl i skärm, PDF och delad länk.",
          },
        ],
      },
      {
        heading: "För flyttfirmor",
        items: [
          {
            q: "Kan vi använda egen logotyp och företagsuppgifter?",
            a: "Ja. I företagsprofilen lägger ni in logotyp, profilfärg, företagsnamn, organisationsnummer, adress, telefon, e-post och webbplats. Det visas i rapporten, PDF:en och headern när ni är inloggade.",
          },
          {
            q: "Hur sätter vi pris?",
            a: "Lägg in pris per m³ och valuta i företagsprofilen. Rapporten räknar ut uppskattat pris automatiskt, och i företagsvyn kan ni även räkna på timpris.",
          },
        ],
      },
      {
        heading: "Priser och integritet",
        items: [
          {
            q: "Vad kostar det?",
            a: "Privatpersoner kan prova gratis och köpa en uppskattning eller ett paket med tre. Flyttfirmor har ett eget abonnemang. Se prissidan för aktuella priser.",
          },
          {
            q: "Vad händer med min rumsvideo?",
            a: "Din uppskattning bygger på rumsvideo och checklista. Ditt material hålls privat och raderas senast 12 månader efter senaste aktivitet. Vill du få det borttaget tidigare hjälper vi gärna till via kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  da: {
    title: "Hjælp og ofte stillede spørgsmål",
    intro:
      "Alt du skal bruge for at komme i gang med VolumCalc – fra rumvideo og rolig tjekliste til færdig rapport, pakning, opbevaring og deling.",
    ctaTitle: "Fandt du ikke svaret?",
    ctaText: "Send os et par ord, så svarer vi som regel inden for én hverdag.",
    cta: "Start en gratis vurdering",
    contact: "Kontakt os",
    groups: [
      {
        heading: "Rumvideo",
        items: [
          {
            q: "Hvor længe skal jeg filme hvert rum?",
            a: "Tag en rolig runde gennem rummet i dit eget tempo, så de vigtigste møbler er tydelige. Du behøver ikke nærbilleder af alting, fordi du bekræfter indholdet i tjeklisten bagefter.",
          },
          {
            q: "Hvad giver det bedste resultat?",
            a: "Godt lys, ryddelige flader og en jævn videorunde fra døråbningen, så hele rummet kommer med. Hold mobilen roligt og tag den tid, du har brug for.",
          },
          {
            q: "Skal jeg filme inde i skabe og skuffer?",
            a: "Nej. Indholdet tælles normalt som flyttekasser, så du kan i stedet bekræfte antallet i tjeklisten, når videoen er færdig.",
          },
        ],
      },
      {
        heading: "Rum og redigering",
        items: [
          {
            q: "Hvordan havner tingene i det rigtige rum?",
            a: "Du vælger rummet, før du filmer, og går derefter gennem en tjekliste, der passer til netop det rum.",
          },
          {
            q: "Kan jeg omdøbe rum og flytte ting?",
            a: "Ja. I rapporten kan du omdøbe rum, flytte en ting til et andet rum, ændre antal og mål, tilføje noter og markere ting som skrøbelige, tunge, til demontering eller ting, der ikke skal med.",
          },
          {
            q: "Hvad hvis noget mangler eller er forkert?",
            a: "Bare rolig — justér antallet direkte i tjeklisten. Totalerne opdateres med det samme.",
          },
        ],
      },
      {
        heading: "Volumen og køretøj",
        items: [
          {
            q: "Hvad er nettovolumen og anbefalet volumen?",
            a: "Nettovolumen er summen af tingene. Anbefalet volumen lægger 25 % til for luft mellem møblerne og er tallet, du bør bruge til bil eller lager.",
          },
          {
            q: "Hvilken bil har jeg brug for?",
            a: "Rapporten foreslår en bilstørrelse ud fra den anbefalede volumen. Du kan også regne det ud i vores flyttebilberegner.",
          },
        ],
      },
      {
        heading: "Pakning, opbevaring og levering",
        items: [
          {
            q: "Kan jeg bede om hjælp til pakning?",
            a: "Ja. I rapporten markerer du pakkehjælp, vælger omfang og angiver materialer som kasser, bobleplast, pakkepapir, tape, garderobekasser, madrasposer og møbeltæpper.",
          },
          {
            q: "Vi skal have mellemopbevaring. Hvor noterer jeg det?",
            a: "Udfyld opbevaringsfeltet med lagerfirmaets navn, fulde adresse og kontaktperson. Det følger med i rapporten og PDF’en.",
          },
          {
            q: "Hvor tilføjer jeg den nye adresse?",
            a: "Under levering til ny bolig: fuld adresse, etage, om der er elevator, bæreafstand og eventuelle bemærkninger.",
          },
        ],
      },
      {
        heading: "Deling, sprog og PDF",
        items: [
          {
            q: "Kan jeg gemme rapporten på flere sprog?",
            a: "Ja. Vælg det rapportsprog, der passer bedst. Alt, du selv har redigeret, bliver bevaret — det er kun de faste tekster, der skifter.",
          },
          {
            q: "Hvordan deler jeg rapporten?",
            a: "Brug ”Del hemmeligt link”. Alle med linket kan se rapporten uden at logge ind, så del det kun med de rigtige modtagere.",
          },
          {
            q: "Hvordan skjuler jeg prisen, når jeg sender udbud?",
            a: "Slå tilbudstilstand til i rapporten. Så skjules estimeret pris og prisberegning på skærm, i PDF og i delt link.",
          },
        ],
      },
      {
        heading: "For flyttefirmaer",
        items: [
          {
            q: "Kan vi bruge vores eget logo og virksomhedsoplysninger?",
            a: "Ja. Under virksomhedsprofil lægger I logo, profilfarve, firmanavn, CVR-nummer, adresse, telefon, e-mail og website ind. Det vises i rapporten, PDF’en og headeren, når I er logget ind.",
          },
          {
            q: "Hvordan fastsætter vi pris?",
            a: "Indtast pris pr. m³ og valuta i virksomhedsprofilen. Rapporten beregner den estimerede pris automatisk, og i virksomhedsvisningen kan I også regne på timepris.",
          },
        ],
      },
      {
        heading: "Priser og privatliv",
        items: [
          {
            q: "Hvad koster det?",
            a: "Privatpersoner kan prøve gratis og købe én vurdering eller en pakke med tre. Flyttefirmaer har deres eget abonnement. Se prissiden for aktuelle priser.",
          },
          {
            q: "Hvad sker der med min rumvideo?",
            a: "Din vurdering bygger på rumvideo og tjekliste. Dit materiale opbevares privat og slettes senest 12 måneder efter sidste aktivitet. Ønsker du hurtigere sletning, hjælper vi gerne via kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  fi: {
    title: "Ohjeet ja usein kysytyt kysymykset",
    intro:
      "Kaikki mitä tarvitset päästäksesi alkuun VolumCalcin kanssa – huonevideosta ja rauhallisesta tarkistuslistasta valmiiseen raporttiin, pakkaamiseen, varastointiin ja jakamiseen.",
    ctaTitle: "Etkö löytänyt vastausta?",
    ctaText: "Lähetä meille muutama sana, niin vastaamme yleensä yhden arkipäivän sisällä.",
    cta: "Aloita ilmainen arvio",
    contact: "Ota yhteyttä",
    groups: [
      {
        heading: "Huonevideo",
        items: [
          {
            q: "Kuinka pitkän videon kustakin huoneesta pitäisi kuvata?",
            a: "Kävele huone rauhallisesti läpi omaan tahtiisi, jotta tärkeimmät kalusteet näkyvät selvästi. Et tarvitse lähikuvia kaikesta, koska vahvistat sisällön tarkistuslistassa jälkeenpäin.",
          },
          {
            q: "Mikä tuottaa parhaan lopputuloksen?",
            a: "Hyvä valo, selkeät pinnat ja tasainen videokierros oviaukosta niin, että koko huone näkyy. Pidä puhelin vakaana ja ota tarvitsemasi aika.",
          },
          {
            q: "Pitääkö kaappien ja laatikoiden sisälle kuvata?",
            a: "Ei tarvitse. Sisältö lasketaan yleensä muuttolaatikoiksi, joten voit vahvistaa määrän tarkistuslistassa videon jälkeen.",
          },
        ],
      },
      {
        heading: "Huoneet ja muokkaus",
        items: [
          {
            q: "Miten tavarat päätyvät oikeaan huoneeseen?",
            a: "Valitset huoneen ennen kuvausta ja käyt sitten läpi juuri siihen huoneeseen sopivan tarkistuslistan.",
          },
          {
            q: "Voinko nimetä huoneita uudelleen ja siirtää tavaroita?",
            a: "Kyllä. Raportissa voit nimetä huoneita uudelleen, siirtää tavaran toiseen huoneeseen, muuttaa määriä ja mittoja, lisätä huomioita sekä merkitä särkyvää, raskasta, purettavaa tai pois jäävää tavaraa.",
          },
          {
            q: "Entä jos jotain puuttuu tai menee väärin?",
            a: "Ei hätää — säädä määriä suoraan tarkistuslistassa. Kokonaismäärät päivittyvät heti.",
          },
        ],
      },
      {
        heading: "Tilavuus ja ajoneuvo",
        items: [
          {
            q: "Mitä nettotilavuus ja suositeltu tilavuus tarkoittavat?",
            a: "Nettotilavuus on tavaroiden summa. Suositeltu tilavuus lisää 25 % ilmatilaa kalusteiden väliin, ja sitä kannattaa käyttää autoa tai varastoa valitessa.",
          },
          {
            q: "Millaisen auton tarvitsen?",
            a: "Raportti ehdottaa ajoneuvon kokoa suositellun tilavuuden perusteella. Voit myös laskea sen itse muuttoautolaskurillamme.",
          },
        ],
      },
      {
        heading: "Pakkaus, varastointi ja toimitus",
        items: [
          {
            q: "Voinko pyytää apua pakkaamiseen?",
            a: "Kyllä. Raportissa voit valita pakkausavun, sen laajuuden ja tarvittavat materiaalit, kuten laatikot, kuplamuovin, pakkauspaperin, teipin, vaaterasiat, patjapussit ja huonekaluhuovat.",
          },
          {
            q: "Tarvitsemme välivarastointia. Mihin se merkitään?",
            a: "Täytä varastointikohta varastoyrityksen nimellä, täydellä osoitteella ja yhteyshenkilöllä. Tiedot tulevat mukaan raporttiin ja PDF:ään.",
          },
          {
            q: "Mihin lisään uuden osoitteen?",
            a: "Kohtaan toimitus uuteen kotiin: täydellinen osoite, kerros, onko hissiä, kantomatka ja mahdolliset lisätiedot.",
          },
        ],
      },
      {
        heading: "Jakaminen, kielet ja PDF",
        items: [
          {
            q: "Voinko tallentaa raportin useilla kielillä?",
            a: "Kyllä. Valitse raportille sinulle parhaiten sopiva kieli. Kaikki itse muokkaamasi säilyy — vain kiinteät tekstit vaihtuvat.",
          },
          {
            q: "Miten jaan raportin?",
            a: "Käytä ”Jaa salainen linkki” -toimintoa. Linkin saanut voi avata raportin ilman kirjautumista, joten jaa se vain oikeille vastaanottajille.",
          },
          {
            q: "Miten piilotan hinnan tarjouspyyntöjä varten?",
            a: "Ota tarjouspyyntötila käyttöön raportissa. Silloin arvioitu hinta ja hintalaskelmat poistuvat näytöltä, PDF:stä ja jaetusta linkistä.",
          },
        ],
      },
      {
        heading: "Muuttoyrityksille",
        items: [
          {
            q: "Voimmeko käyttää omaa logoamme ja yritystietojamme?",
            a: "Kyllä. Yritysprofiiliin lisätään logo, brändiväri, yrityksen nimi, rekisterinumero, osoite, puhelin, sähköposti ja verkkosivusto. Ne näkyvät raportissa, PDF:ssä ja kirjautuneen käyttäjän yläosassa.",
          },
          {
            q: "Miten asetamme hinnan?",
            a: "Lisää yritysprofiiliin hinta per m³ ja valuutta. Raportti laskee arvioidun hinnan automaattisesti, ja yritysnäkymässä voi laskea myös tuntihinnan mukaan.",
          },
        ],
      },
      {
        heading: "Hinnat ja yksityisyys",
        items: [
          {
            q: "Mitä tämä maksaa?",
            a: "Yksityishenkilöt voivat kokeilla ilmaiseksi ja ostaa yhden arvion tai kolmen paketin. Muuttoyrityksille on oma tilaus. Katso ajantasaiset hinnat hinnastosivulta.",
          },
          {
            q: "Mitä huonevideolleni tapahtuu?",
            a: "Arviosi perustuu huonevideoon ja tarkistuslistaan. Materiaalisi säilyy yksityisenä ja poistetaan viimeistään 12 kuukauden kuluttua viimeisestä aktiivisuudesta. Jos haluat nopeamman poiston, autamme mielellämme osoitteessa kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  de: {
    title: "Hilfe und häufige Fragen",
    intro:
      "Alles, was Sie für den Start mit VolumCalc brauchen – vom Raumvideo und der ruhigen Checkliste bis zum fertigen Bericht, Packen, Einlagern und Teilen.",
    ctaTitle: "Nicht die passende Antwort gefunden?",
    ctaText: "Schreiben Sie uns ein paar Zeilen, und wir antworten meist innerhalb eines Werktags.",
    cta: "Kostenlose Schätzung starten",
    contact: "Kontakt aufnehmen",
    groups: [
      {
        heading: "Raumvideo",
        items: [
          {
            q: "Wie lange sollte ich jeden Raum filmen?",
            a: "Machen Sie in Ihrem eigenen Tempo einen ruhigen Rundgang durch den Raum, damit die wichtigsten Möbel gut zu sehen sind. Nahaufnahmen von allem sind nicht nötig, denn danach bestätigen Sie den Inhalt in der Checkliste.",
          },
          {
            q: "Was sorgt für das beste Ergebnis?",
            a: "Gutes Licht, freie Flächen und ein gleichmäßiger Videorundgang von der Tür aus, damit der ganze Raum erfasst wird. Halten Sie das Handy ruhig und nehmen Sie sich die Zeit, die Sie brauchen.",
          },
          {
            q: "Muss ich Schränke und Schubladen von innen filmen?",
            a: "Nein. Der Inhalt wird meist als Umzugskartons erfasst, daher können Sie die Menge einfach später in der Checkliste bestätigen.",
          },
        ],
      },
      {
        heading: "Räume und Bearbeitung",
        items: [
          {
            q: "Wie kommen die Dinge in den richtigen Raum?",
            a: "Sie wählen den Raum vor dem Filmen aus und gehen danach eine Checkliste durch, die genau zu diesem Raum passt.",
          },
          {
            q: "Kann ich Räume umbenennen und Gegenstände verschieben?",
            a: "Ja. Im Bericht können Sie Räume umbenennen, Gegenstände in andere Räume verschieben, Mengen und Maße ändern, Notizen ergänzen und Dinge als zerbrechlich, schwer, zu demontieren oder nicht umzugsrelevant markieren.",
          },
          {
            q: "Was ist, wenn etwas fehlt oder nicht stimmt?",
            a: "Kein Problem — passen Sie die Mengen direkt in der Checkliste an. Die Summen werden sofort aktualisiert.",
          },
        ],
      },
      {
        heading: "Volumen und Fahrzeug",
        items: [
          {
            q: "Was bedeuten Nettovolumen und empfohlenes Volumen?",
            a: "Das Nettovolumen ist die Summe aller Gegenstände. Das empfohlene Volumen rechnet 25 % Luft zwischen den Möbeln hinzu und ist der Wert, den Sie für Fahrzeug oder Lager nutzen sollten.",
          },
          {
            q: "Welches Fahrzeug brauche ich?",
            a: "Der Bericht schlägt auf Basis des empfohlenen Volumens eine Fahrzeuggröße vor. Sie können es auch mit unserem Umzugswagen-Rechner selbst berechnen.",
          },
        ],
      },
      {
        heading: "Packen, Lagerung und Lieferung",
        items: [
          {
            q: "Kann ich Hilfe beim Packen anfragen?",
            a: "Ja. Im Bericht markieren Sie Packhilfe, wählen den Umfang und tragen benötigtes Material ein – etwa Kartons, Luftpolsterfolie, Packpapier, Klebeband, Kleiderboxen, Matratzensäcke und Möbeldecken.",
          },
          {
            q: "Wir brauchen Zwischenlagerung. Wo trage ich das ein?",
            a: "Füllen Sie den Bereich zur Lagerung mit Firmenname, vollständiger Adresse und Ansprechperson des Lagers aus. Das erscheint im Bericht und im PDF.",
          },
          {
            q: "Wo gebe ich die neue Adresse ein?",
            a: "Unter Lieferung zur neuen Wohnung: vollständige Adresse, Etage, Aufzug, Trageweg und eventuelle Hinweise.",
          },
        ],
      },
      {
        heading: "Teilen, Sprache und PDF",
        items: [
          {
            q: "Kann ich den Bericht in mehreren Sprachen speichern?",
            a: "Ja. Wählen Sie einfach die Berichtssprache, die am besten passt. Alles, was Sie selbst bearbeitet haben, bleibt erhalten — nur die festen Texte wechseln.",
          },
          {
            q: "Wie teile ich den Bericht?",
            a: "Nutzen Sie „Geheimen Link teilen“. Jede Person mit dem Link kann den Bericht ohne Anmeldung sehen, daher sollten Sie ihn nur mit den richtigen Empfängerinnen und Empfängern teilen.",
          },
          {
            q: "Wie blende ich Preise aus, wenn ich Angebote einhole?",
            a: "Aktivieren Sie im Bericht den Ausschreibungsmodus. Dann verschwinden geschätzter Preis und Preiskalkulation auf dem Bildschirm, im PDF und im geteilten Link.",
          },
        ],
      },
      {
        heading: "Für Umzugsunternehmen",
        items: [
          {
            q: "Können wir unser eigenes Logo und unsere Firmendaten verwenden?",
            a: "Ja. Im Firmenprofil hinterlegen Sie Logo, Markenfarbe, Firmenname, Registernummer, Adresse, Telefon, E-Mail und Website. Alles erscheint oben im Bericht, im PDF und im Header nach dem Login.",
          },
          {
            q: "Wie legen wir Preise fest?",
            a: "Tragen Sie Preis pro m³ und Währung im Firmenprofil ein. Der Bericht berechnet den geschätzten Preis automatisch, und in der Unternehmensansicht können Sie zusätzlich mit Stundensätzen arbeiten.",
          },
        ],
      },
      {
        heading: "Preise und Datenschutz",
        items: [
          {
            q: "Was kostet das?",
            a: "Privatpersonen können kostenlos testen und eine einzelne Schätzung oder ein Dreierpaket kaufen. Für Umzugsunternehmen gibt es ein eigenes Abo. Aktuelle Preise finden Sie auf der Preisseite.",
          },
          {
            q: "Was passiert mit meinem Raumvideo?",
            a: "Ihre Schätzung basiert auf Raumvideo und Checkliste. Ihr Material bleibt privat und wird spätestens 12 Monate nach der letzten Aktivität gelöscht. Wenn Sie eine frühere Löschung wünschen, helfen wir gern unter kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  nl: {
    title: "Hulp en veelgestelde vragen",
    intro:
      "Alles wat je nodig hebt om met VolumCalc te starten – van kamervideo en rustige checklist tot afgerond rapport, inpakken, opslag en delen.",
    ctaTitle: "Geen passend antwoord gevonden?",
    ctaText: "Stuur ons een paar woorden en we reageren meestal binnen één werkdag.",
    cta: "Start een gratis schatting",
    contact: "Contact opnemen",
    groups: [
      {
        heading: "Kamervideo",
        items: [
          {
            q: "Hoe lang moet ik elke kamer filmen?",
            a: "Loop rustig door de kamer in je eigen tempo, zodat de belangrijkste meubels goed zichtbaar zijn. Close-ups van alles zijn niet nodig, want daarna bevestig je de inhoud in de checklist.",
          },
          {
            q: "Wat geeft het beste resultaat?",
            a: "Goed licht, opgeruimde oppervlakken en een vloeiende videoronde vanaf de deuropening, zodat de hele kamer in beeld komt. Houd je telefoon stabiel en neem rustig de tijd.",
          },
          {
            q: "Moet ik in kasten en lades filmen?",
            a: "Nee. De inhoud telt meestal als verhuisdozen, dus je kunt het aantal later gewoon in de checklist bevestigen.",
          },
        ],
      },
      {
        heading: "Kamers en bewerken",
        items: [
          {
            q: "Hoe komen spullen in de juiste kamer terecht?",
            a: "Je kiest de kamer vóór het filmen en doorloopt daarna een checklist die precies bij die kamer past.",
          },
          {
            q: "Kan ik kamers hernoemen en spullen verplaatsen?",
            a: "Ja. In het rapport kun je kamers hernoemen, een item naar een andere kamer verplaatsen, aantallen en afmetingen aanpassen, notities toevoegen en items markeren als breekbaar, zwaar, te demonteren of niet mee te nemen.",
          },
          {
            q: "Wat als er iets ontbreekt of niet klopt?",
            a: "Geen probleem — pas de aantallen direct aan in de checklist. De totalen worden meteen bijgewerkt.",
          },
        ],
      },
      {
        heading: "Volume en voertuig",
        items: [
          {
            q: "Wat is netto volume en aanbevolen volume?",
            a: "Netto volume is de som van alle items. Aanbevolen volume telt 25% extra ruimte tussen meubels mee en is het getal dat je moet gebruiken voor een voertuig of opslagruimte.",
          },
          {
            q: "Welk voertuig heb ik nodig?",
            a: "Het rapport stelt op basis van het aanbevolen volume een voertuigmaat voor. Je kunt het ook zelf berekenen met onze verhuiswagen-calculator.",
          },
        ],
      },
      {
        heading: "Inpakken, opslag en levering",
        items: [
          {
            q: "Kan ik hulp bij het inpakken aanvragen?",
            a: "Ja. In het rapport vink je inpakhulp aan, kies je de omvang en vul je benodigde materialen in, zoals dozen, noppenfolie, pakpapier, tape, garderobedozen, matrashoezen en verhuisdekens.",
          },
          {
            q: "We hebben tijdelijke opslag nodig. Waar noteer ik dat?",
            a: "Vul het opslaggedeelte in met de bedrijfsnaam, het volledige adres en een contactpersoon van de opslaglocatie. Dat komt mee in het rapport en de pdf.",
          },
          {
            q: "Waar voeg ik het nieuwe adres toe?",
            a: "Bij levering op het nieuwe adres: volledig adres, verdieping, lift, draagafstand en eventuele opmerkingen.",
          },
        ],
      },
      {
        heading: "Delen, taal en pdf",
        items: [
          {
            q: "Kan ik het rapport in meerdere talen opslaan?",
            a: "Ja. Kies gewoon de rapporttaal die het beste past. Alles wat je zelf hebt aangepast blijft staan — alleen de vaste teksten veranderen.",
          },
          {
            q: "Hoe deel ik het rapport?",
            a: "Gebruik ‘Geheime link delen’. Iedereen met de link kan het rapport zonder inloggen bekijken, dus deel hem alleen met de juiste ontvangers.",
          },
          {
            q: "Hoe verberg ik de prijs als ik offertes opvraag?",
            a: "Zet in het rapport de offertemodus aan. Dan verdwijnen de geschatte prijs en alle prijsberekeningen uit beeld, uit de pdf en uit de gedeelde link.",
          },
        ],
      },
      {
        heading: "Voor verhuisbedrijven",
        items: [
          {
            q: "Kunnen we ons eigen logo en onze bedrijfsgegevens gebruiken?",
            a: "Ja. In het bedrijfsprofiel voeg je logo, merkkleur, bedrijfsnaam, registratienummer, adres, telefoon, e-mail en website toe. Dat verschijnt bovenaan het rapport, in de pdf en in de header wanneer jullie zijn ingelogd.",
          },
          {
            q: "Hoe stellen we prijzen in?",
            a: "Vul prijs per m³ en valuta in het bedrijfsprofiel in. Het rapport berekent de geschatte prijs automatisch, en in de zakelijke weergave kun je ook met een uurtarief rekenen.",
          },
        ],
      },
      {
        heading: "Prijzen en privacy",
        items: [
          {
            q: "Wat kost het?",
            a: "Particulieren kunnen het gratis proberen en één schatting of een pakket van drie kopen. Verhuisbedrijven hebben een eigen abonnement. Kijk op de prijspagina voor de actuele prijzen.",
          },
          {
            q: "Wat gebeurt er met mijn kamervideo?",
            a: "Je schatting is gebaseerd op kamervideo en checklist. Je materiaal blijft privé en wordt uiterlijk 12 maanden na de laatste activiteit verwijderd. Wil je het eerder laten wissen, dan helpen we graag via kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  fr: {
    title: "Aide et questions fréquentes",
    intro:
      "Tout ce qu’il vous faut pour démarrer avec VolumCalc – de la vidéo de pièce et la checklist tranquille jusqu’au rapport final, à l’emballage, au stockage et au partage.",
    ctaTitle: "Vous n’avez pas trouvé votre réponse ?",
    ctaText: "Écrivez-nous quelques mots et nous répondons généralement sous un jour ouvré.",
    cta: "Commencer une estimation gratuite",
    contact: "Nous contacter",
    groups: [
      {
        heading: "Vidéo de pièce",
        items: [
          {
            q: "Combien de temps dois-je filmer chaque pièce ?",
            a: "Faites un tour calme de la pièce à votre rythme afin que les meubles principaux soient bien visibles. Pas besoin de gros plans sur chaque objet, puisque vous confirmez ensuite le contenu dans la checklist.",
          },
          {
            q: "Qu’est-ce qui donne le meilleur résultat ?",
            a: "Une bonne lumière, des surfaces dégagées et un mouvement fluide depuis l’entrée pour bien montrer toute la pièce. Tenez votre téléphone de façon stable et prenez votre temps.",
          },
          {
            q: "Dois-je filmer l’intérieur des placards et tiroirs ?",
            a: "Non. Leur contenu est généralement compté comme des cartons, donc vous pouvez simplement confirmer les quantités dans la checklist après la vidéo.",
          },
        ],
      },
      {
        heading: "Pièces et modifications",
        items: [
          {
            q: "Comment les objets sont-ils placés dans la bonne pièce ?",
            a: "Vous choisissez la pièce avant de filmer, puis vous passez en revue une checklist adaptée à cette pièce précise.",
          },
          {
            q: "Puis-je renommer les pièces et déplacer des objets ?",
            a: "Oui. Dans le rapport, vous pouvez renommer les pièces, déplacer un objet vers une autre pièce, modifier les quantités et dimensions, ajouter des notes et marquer des éléments comme fragiles, lourds, à démonter ou à ne pas déplacer.",
          },
          {
            q: "Et s’il manque quelque chose ou si une erreur s’est glissée ?",
            a: "Pas d’inquiétude — ajustez simplement les quantités directement dans la checklist. Les totaux se mettent à jour immédiatement.",
          },
        ],
      },
      {
        heading: "Volume et véhicule",
        items: [
          {
            q: "Que signifient volume net et volume recommandé ?",
            a: "Le volume net est la somme des objets. Le volume recommandé ajoute 25 % d’espace entre les meubles et c’est la valeur à utiliser pour choisir un véhicule ou un box de stockage.",
          },
          {
            q: "Quel véhicule me faut-il ?",
            a: "Le rapport suggère une taille de véhicule à partir du volume recommandé. Vous pouvez aussi le calculer avec notre calculateur de camion de déménagement.",
          },
        ],
      },
      {
        heading: "Emballage, stockage et livraison",
        items: [
          {
            q: "Puis-je demander de l’aide pour l’emballage ?",
            a: "Oui. Dans le rapport, vous cochez l’aide à l’emballage, choisissez l’ampleur et indiquez les fournitures nécessaires, comme cartons, papier bulle, papier d’emballage, ruban, penderies, housses de matelas et couvertures de protection.",
          },
          {
            q: "Nous avons besoin d’un stockage temporaire. Où l’indiquer ?",
            a: "Renseignez la section stockage avec le nom de l’entreprise, l’adresse complète et la personne de contact. Ces informations sont reprises dans le rapport et le PDF.",
          },
          {
            q: "Où ajouter la nouvelle adresse ?",
            a: "Dans la section livraison au nouveau logement : adresse complète, étage, présence d’un ascenseur, distance de portage et éventuelles remarques.",
          },
        ],
      },
      {
        heading: "Partage, langue et PDF",
        items: [
          {
            q: "Puis-je enregistrer le rapport dans plusieurs langues ?",
            a: "Oui. Choisissez simplement la langue du rapport qui vous convient le mieux. Tout ce que vous avez modifié vous-même est conservé — seuls les textes fixes changent.",
          },
          {
            q: "Comment partager le rapport ?",
            a: "Utilisez « Partager le lien secret ». Toute personne ayant le lien peut voir le rapport sans se connecter, alors partagez-le seulement avec les bons destinataires.",
          },
          {
            q: "Comment masquer le prix lorsque j’invite des entreprises à répondre ?",
            a: "Activez le mode appel d’offres dans le rapport. Le prix estimé et tous les calculs tarifaires disparaissent alors de l’écran, du PDF et du lien partagé.",
          },
        ],
      },
      {
        heading: "Pour les déménageurs",
        items: [
          {
            q: "Pouvons-nous utiliser notre propre logo et nos coordonnées ?",
            a: "Oui. Dans le profil de l’entreprise, vous ajoutez le logo, la couleur de marque, le nom, le numéro d’enregistrement, l’adresse, le téléphone, l’e-mail et le site web. Tout apparaît en haut du rapport, dans le PDF et dans l’en-tête quand vous êtes connecté.",
          },
          {
            q: "Comment définir nos prix ?",
            a: "Indiquez le prix par m³ et la devise dans le profil de l’entreprise. Le rapport calcule automatiquement le prix estimé, et la vue entreprise permet aussi de travailler avec un tarif horaire.",
          },
        ],
      },
      {
        heading: "Tarifs et confidentialité",
        items: [
          {
            q: "Quel est le prix ?",
            a: "Les particuliers peuvent essayer gratuitement puis acheter une estimation unique ou un pack de trois. Les déménageurs disposent d’un abonnement dédié. Consultez la page tarifs pour les prix à jour.",
          },
          {
            q: "Que devient ma vidéo de pièce ?",
            a: "Votre estimation repose sur la vidéo de pièce et la checklist. Vos médias restent privés et sont supprimés au plus tard 12 mois après la dernière activité. Si vous souhaitez une suppression plus rapide, écrivez-nous à kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  pl: {
    title: "Pomoc i najczęściej zadawane pytania",
    intro:
      "Wszystko, czego potrzebujesz, by zacząć z VolumCalc – od nagrania pokoju i spokojnej listy kontrolnej po gotowy raport, pakowanie, magazynowanie i udostępnianie.",
    ctaTitle: "Nie znalazłeś odpowiedzi?",
    ctaText: "Napisz do nas kilka słów, a zwykle odpowiemy w ciągu jednego dnia roboczego.",
    cta: "Rozpocznij darmową wycenę",
    contact: "Skontaktuj się z nami",
    groups: [
      {
        heading: "Nagranie pokoju",
        items: [
          {
            q: "Jak długo powinienem nagrywać każdy pokój?",
            a: "Przejdź spokojnie przez pokój we własnym tempie, tak aby najważniejsze meble były dobrze widoczne. Nie potrzebujesz zbliżeń wszystkiego, bo potem potwierdzasz zawartość na liście kontrolnej.",
          },
          {
            q: "Co daje najlepszy efekt?",
            a: "Dobre światło, uporządkowane powierzchnie i płynne nagranie od wejścia tak, aby objąć cały pokój. Trzymaj telefon stabilnie i nie spiesz się.",
          },
          {
            q: "Czy muszę nagrywać wnętrza szaf i szuflad?",
            a: "Nie. Ich zawartość zwykle liczy się jako kartony przeprowadzkowe, więc możesz po prostu potwierdzić ilość na liście kontrolnej po nagraniu.",
          },
        ],
      },
      {
        heading: "Pokoje i edycja",
        items: [
          {
            q: "Jak rzeczy trafiają do właściwego pokoju?",
            a: "Wybierasz pokój przed nagrywaniem, a potem przechodzisz przez listę kontrolną dopasowaną właśnie do tego pomieszczenia.",
          },
          {
            q: "Czy mogę zmieniać nazwy pokoi i przenosić rzeczy?",
            a: "Tak. W raporcie możesz zmieniać nazwy pokoi, przenosić przedmioty do innego pokoju, zmieniać ilość i wymiary, dodawać notatki oraz oznaczać rzeczy jako delikatne, ciężkie, do demontażu albo niewywożone.",
          },
          {
            q: "Co jeśli czegoś brakuje albo coś się nie zgadza?",
            a: "Bez obaw — popraw ilości bezpośrednio na liście kontrolnej. Sumy aktualizują się od razu.",
          },
        ],
      },
      {
        heading: "Objętość i pojazd",
        items: [
          {
            q: "Co oznacza objętość netto i zalecana objętość?",
            a: "Objętość netto to suma wszystkich rzeczy. Zalecana objętość dodaje 25% zapasu na przestrzeń między meblami i to właśnie jej warto użyć przy wyborze auta lub magazynu.",
          },
          {
            q: "Jakiego auta potrzebuję?",
            a: "Raport sugeruje wielkość pojazdu na podstawie zalecanej objętości. Możesz też policzyć to samodzielnie w naszym kalkulatorze auta do przeprowadzki.",
          },
        ],
      },
      {
        heading: "Pakowanie, magazynowanie i dostawa",
        items: [
          {
            q: "Czy mogę poprosić o pomoc przy pakowaniu?",
            a: "Tak. W raporcie zaznaczasz pomoc przy pakowaniu, wybierasz zakres i wpisujesz potrzebne materiały, takie jak kartony, folia bąbelkowa, papier, taśma, kartony garderobiane, worki na materace i koce do mebli.",
          },
          {
            q: "Potrzebujemy magazynu pośredniego. Gdzie to wpisać?",
            a: "Uzupełnij sekcję magazynowania nazwą firmy, pełnym adresem i osobą kontaktową. Informacja trafi do raportu i PDF-u.",
          },
          {
            q: "Gdzie dodać nowy adres?",
            a: "W sekcji dostawy do nowego domu: pełny adres, piętro, informacja o windzie, odległość noszenia i ewentualne uwagi.",
          },
        ],
      },
      {
        heading: "Udostępnianie, język i PDF",
        items: [
          {
            q: "Czy mogę zapisać raport w kilku językach?",
            a: "Tak. Wybierz język raportu, który najbardziej Ci odpowiada. Wszystko, co edytujesz samodzielnie, zostaje zachowane — zmieniają się tylko stałe teksty.",
          },
          {
            q: "Jak udostępnić raport?",
            a: "Użyj opcji „Udostępnij tajny link”. Każdy, kto ma link, może zobaczyć raport bez logowania, więc udostępniaj go tylko właściwym osobom.",
          },
          {
            q: "Jak ukryć cenę, gdy wysyłam zapytania ofertowe?",
            a: "Włącz tryb przetargowy w raporcie. Szacowana cena i wszystkie kalkulacje znikną wtedy z ekranu, PDF-u i udostępnionego linku.",
          },
        ],
      },
      {
        heading: "Dla firm przeprowadzkowych",
        items: [
          {
            q: "Czy możemy używać własnego logo i danych firmy?",
            a: "Tak. W profilu firmy dodajecie logo, kolor marki, nazwę firmy, numer rejestracyjny, adres, telefon, e-mail i stronę internetową. Wszystko pojawia się u góry raportu, w PDF-ie i w nagłówku po zalogowaniu.",
          },
          {
            q: "Jak ustawić ceny?",
            a: "Wpiszcie cenę za m³ i walutę w profilu firmy. Raport oblicza szacowaną cenę automatycznie, a widok firmowy pozwala też pracować na stawce godzinowej.",
          },
        ],
      },
      {
        heading: "Ceny i prywatność",
        items: [
          {
            q: "Ile to kosztuje?",
            a: "Osoby prywatne mogą wypróbować usługę za darmo i kupić jedną wycenę albo pakiet trzech. Firmy przeprowadzkowe mają osobną subskrypcję. Aktualne ceny znajdziesz na stronie cennika.",
          },
          {
            q: "Co dzieje się z moim nagraniem pokoju?",
            a: "Twoja wycena opiera się na nagraniu pokoju i liście kontrolnej. Materiał pozostaje prywatny i jest usuwany najpóźniej 12 miesięcy po ostatniej aktywności. Jeśli chcesz usunąć go wcześniej, napisz do nas na kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  es: {
    title: "Ayuda y preguntas frecuentes",
    intro:
      "Todo lo que necesitas para empezar con VolumCalc: desde el video de cada habitación y la checklist tranquila hasta el informe final, embalaje, almacenamiento y uso compartido.",
    ctaTitle: "¿No encontraste tu respuesta?",
    ctaText: "Envíanos unas palabras y normalmente respondemos en un día laborable.",
    cta: "Empezar una estimación gratis",
    contact: "Contáctanos",
    groups: [
      {
        heading: "Video de habitación",
        items: [
          {
            q: "¿Cuánto debería durar el video de cada habitación?",
            a: "Haz un recorrido tranquilo por la habitación a tu ritmo para que los muebles principales se vean con claridad. No hace falta acercarse a todo, porque después confirmas el contenido en la checklist.",
          },
          {
            q: "¿Qué da el mejor resultado?",
            a: "Buena luz, superficies despejadas y una toma fluida desde la puerta para que se vea toda la habitación. Mantén el móvil firme y tómate el tiempo que necesites.",
          },
          {
            q: "¿Tengo que grabar dentro de armarios y cajones?",
            a: "No. Su contenido suele contarse como cajas de mudanza, así que puedes confirmar la cantidad luego en la checklist.",
          },
        ],
      },
      {
        heading: "Habitaciones y edición",
        items: [
          {
            q: "¿Cómo se asignan los objetos a la habitación correcta?",
            a: "Eliges la habitación antes de grabar y luego revisas una checklist adaptada exactamente a esa estancia.",
          },
          {
            q: "¿Puedo cambiar el nombre de las habitaciones y mover objetos?",
            a: "Sí. En el informe puedes renombrar habitaciones, mover un objeto a otra estancia, cambiar cantidades y medidas, añadir notas y marcar objetos como frágiles, pesados, para desmontar o que no se van a mover.",
          },
          {
            q: "¿Y si falta algo o hay un error?",
            a: "No pasa nada: ajusta las cantidades directamente en la checklist. Los totales se actualizan al momento.",
          },
        ],
      },
      {
        heading: "Volumen y vehículo",
        items: [
          {
            q: "¿Qué significan volumen neto y volumen recomendado?",
            a: "El volumen neto es la suma de los objetos. El volumen recomendado añade un 25% de espacio entre muebles y es la cifra que conviene usar para elegir vehículo o trastero.",
          },
          {
            q: "¿Qué vehículo necesito?",
            a: "El informe sugiere un tamaño de vehículo según el volumen recomendado. También puedes calcularlo en nuestra calculadora de furgón de mudanza.",
          },
        ],
      },
      {
        heading: "Embalaje, almacenamiento y entrega",
        items: [
          {
            q: "¿Puedo pedir ayuda con el embalaje?",
            a: "Sí. En el informe marcas la ayuda de embalaje, eliges el alcance e indicas materiales como cajas, plástico de burbujas, papel, cinta, cajas de armario, fundas para colchones y mantas para muebles.",
          },
          {
            q: "Necesitamos almacenamiento intermedio. ¿Dónde lo indico?",
            a: "Rellena la sección de almacenamiento con el nombre de la empresa, la dirección completa y una persona de contacto. Eso se incluye en el informe y en el PDF.",
          },
          {
            q: "¿Dónde añado la nueva dirección?",
            a: "En la sección de entrega a la nueva vivienda: dirección completa, planta, si hay ascensor, distancia de carga y cualquier observación.",
          },
        ],
      },
      {
        heading: "Compartir, idioma y PDF",
        items: [
          {
            q: "¿Puedo guardar el informe en varios idiomas?",
            a: "Sí. Elige el idioma del informe que mejor te encaje. Todo lo que hayas editado tú se mantiene; solo cambian los textos fijos.",
          },
          {
            q: "¿Cómo comparto el informe?",
            a: "Usa “Compartir enlace secreto”. Cualquiera con el enlace puede ver el informe sin iniciar sesión, así que compártelo solo con las personas adecuadas.",
          },
          {
            q: "¿Cómo oculto el precio cuando pido presupuestos?",
            a: "Activa el modo de licitación en el informe. Así desaparecen el precio estimado y todos los cálculos de precio de la pantalla, del PDF y del enlace compartido.",
          },
        ],
      },
      {
        heading: "Para empresas de mudanzas",
        items: [
          {
            q: "¿Podemos usar nuestro propio logotipo y datos de empresa?",
            a: "Sí. En el perfil de empresa añadís logotipo, color de marca, nombre, número de registro, dirección, teléfono, correo y web. Todo aparece en la parte superior del informe, en el PDF y en la cabecera cuando iniciáis sesión.",
          },
          {
            q: "¿Cómo fijamos los precios?",
            a: "Introducid el precio por m³ y la moneda en el perfil de empresa. El informe calcula el precio estimado automáticamente, y en la vista empresarial también podéis trabajar con tarifa por hora.",
          },
        ],
      },
      {
        heading: "Precios y privacidad",
        items: [
          {
            q: "¿Cuánto cuesta?",
            a: "Los particulares pueden probarlo gratis y comprar una estimación o un paquete de tres. Las empresas de mudanzas tienen su propia suscripción. Consulta la página de precios para ver las tarifas vigentes.",
          },
          {
            q: "¿Qué pasa con mi video de habitación?",
            a: "Tu estimación se basa en el video de habitación y la checklist. Tu material se mantiene privado y se elimina como máximo 12 meses después de la última actividad. Si quieres borrarlo antes, escríbenos a kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  it: {
    title: "Aiuto e domande frequenti",
    intro:
      "Tutto ciò che ti serve per iniziare con VolumCalc – dal video della stanza e dalla checklist tranquilla fino al report finale, all’imballaggio, al deposito e alla condivisione.",
    ctaTitle: "Non hai trovato la risposta?",
    ctaText: "Scrivici due righe e di solito rispondiamo entro un giorno lavorativo.",
    cta: "Inizia una stima gratuita",
    contact: "Contattaci",
    groups: [
      {
        heading: "Video della stanza",
        items: [
          {
            q: "Quanto dovrebbe durare il video di ogni stanza?",
            a: "Fai un giro tranquillo della stanza con i tuoi tempi, in modo che i mobili principali si vedano bene. Non servono primi piani di tutto, perché poi confermi il contenuto nella checklist.",
          },
          {
            q: "Cosa dà il risultato migliore?",
            a: "Buona luce, superfici ordinate e una ripresa fluida dalla porta in modo da mostrare tutta la stanza. Tieni fermo il telefono e prenditi il tempo che ti serve.",
          },
          {
            q: "Devo filmare dentro armadi e cassetti?",
            a: "No. Il contenuto di solito viene conteggiato come scatole da trasloco, quindi puoi confermare la quantità più tardi nella checklist.",
          },
        ],
      },
      {
        heading: "Stanze e modifiche",
        items: [
          {
            q: "Come finiscono gli oggetti nella stanza giusta?",
            a: "Scegli la stanza prima di filmare e poi passi in rassegna una checklist pensata proprio per quella stanza.",
          },
          {
            q: "Posso rinominare le stanze e spostare gli oggetti?",
            a: "Sì. Nel report puoi rinominare le stanze, spostare un oggetto in un’altra stanza, cambiare quantità e misure, aggiungere note e contrassegnare elementi come fragili, pesanti, da smontare o da non trasportare.",
          },
          {
            q: "E se manca qualcosa o c’è un errore?",
            a: "Nessun problema — modifica le quantità direttamente nella checklist. I totali si aggiornano subito.",
          },
        ],
      },
      {
        heading: "Volume e veicolo",
        items: [
          {
            q: "Che differenza c’è tra volume netto e volume consigliato?",
            a: "Il volume netto è la somma degli oggetti. Il volume consigliato aggiunge il 25% di spazio tra i mobili ed è il dato da usare per scegliere veicolo o deposito.",
          },
          {
            q: "Di quale veicolo ho bisogno?",
            a: "Il report suggerisce una dimensione del veicolo in base al volume consigliato. Puoi anche calcolarlo con il nostro calcolatore per il trasloco.",
          },
        ],
      },
      {
        heading: "Imballaggio, deposito e consegna",
        items: [
          {
            q: "Posso chiedere aiuto per l’imballaggio?",
            a: "Sì. Nel report selezioni l’aiuto per l’imballaggio, scegli l’estensione e inserisci i materiali necessari, come scatole, pluriball, carta da imballaggio, nastro, scatole guardaroba, sacchi per materassi e coperte per mobili.",
          },
          {
            q: "Abbiamo bisogno di deposito temporaneo. Dove lo indico?",
            a: "Compila la sezione deposito con il nome dell’azienda, l’indirizzo completo e il referente. Le informazioni entrano nel report e nel PDF.",
          },
          {
            q: "Dove inserisco il nuovo indirizzo?",
            a: "Nella sezione consegna alla nuova casa: indirizzo completo, piano, presenza dell’ascensore, distanza di trasporto ed eventuali note.",
          },
        ],
      },
      {
        heading: "Condivisione, lingua e PDF",
        items: [
          {
            q: "Posso salvare il report in più lingue?",
            a: "Sì. Scegli semplicemente la lingua del report che preferisci. Tutto ciò che hai modificato tu rimane invariato — cambiano solo i testi fissi.",
          },
          {
            q: "Come condivido il report?",
            a: "Usa “Condividi link segreto”. Chiunque abbia il link può vedere il report senza accedere, quindi condividilo solo con le persone giuste.",
          },
          {
            q: "Come nascondo il prezzo quando chiedo offerte?",
            a: "Attiva la modalità gara nel report. Il prezzo stimato e tutti i calcoli di prezzo scompaiono dallo schermo, dal PDF e dal link condiviso.",
          },
        ],
      },
      {
        heading: "Per le aziende di traslochi",
        items: [
          {
            q: "Possiamo usare il nostro logo e i nostri dati aziendali?",
            a: "Sì. Nel profilo aziendale inserite logo, colore del brand, nome azienda, numero di registrazione, indirizzo, telefono, e-mail e sito web. Tutto compare in alto nel report, nel PDF e nell’intestazione quando siete connessi.",
          },
          {
            q: "Come impostiamo i prezzi?",
            a: "Inserite il prezzo per m³ e la valuta nel profilo aziendale. Il report calcola il prezzo stimato automaticamente e nella vista aziendale potete lavorare anche con la tariffa oraria.",
          },
        ],
      },
      {
        heading: "Prezzi e privacy",
        items: [
          {
            q: "Quanto costa?",
            a: "I privati possono provare gratuitamente e acquistare una stima singola o un pacchetto da tre. Le aziende di traslochi hanno un abbonamento dedicato. Consulta la pagina prezzi per gli importi aggiornati.",
          },
          {
            q: "Che cosa succede al mio video della stanza?",
            a: "La tua stima si basa sul video della stanza e sulla checklist. Il tuo materiale resta privato e viene eliminato entro 12 mesi dall’ultima attività. Se desideri una cancellazione prima, scrivici pure a kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
  pt: {
    title: "Ajuda e perguntas frequentes",
    intro:
      "Tudo o que precisa para começar com o VolumCalc – desde o vídeo da divisão e a checklist tranquila até ao relatório final, embalagem, armazenamento e partilha.",
    ctaTitle: "Não encontrou a resposta?",
    ctaText: "Envie-nos algumas palavras e normalmente respondemos dentro de um dia útil.",
    cta: "Começar uma estimativa grátis",
    contact: "Contacte-nos",
    groups: [
      {
        heading: "Vídeo da divisão",
        items: [
          {
            q: "Quanto tempo devo filmar cada divisão?",
            a: "Faça uma volta calma pela divisão ao seu ritmo, para que os móveis principais fiquem bem visíveis. Não precisa de aproximar tudo, porque depois confirma o conteúdo na checklist.",
          },
          {
            q: "O que dá o melhor resultado?",
            a: "Boa luz, superfícies arrumadas e uma volta em vídeo suave a partir da porta, para que toda a divisão apareça. Segure o telemóvel com firmeza e leve o tempo de que precisar.",
          },
          {
            q: "Tenho de filmar dentro de armários e gavetas?",
            a: "Não. O conteúdo costuma contar como caixas de mudança, por isso pode confirmar a quantidade mais tarde na checklist.",
          },
        ],
      },
      {
        heading: "Divisões e edição",
        items: [
          {
            q: "Como é que os objetos ficam na divisão certa?",
            a: "Escolhe a divisão antes de filmar e depois percorre uma checklist adaptada exatamente a esse espaço.",
          },
          {
            q: "Posso mudar o nome das divisões e mover objetos?",
            a: "Sim. No relatório pode renomear divisões, mover um objeto para outra divisão, alterar quantidades e medidas, adicionar notas e marcar itens como frágeis, pesados, para desmontar ou que não seguem na mudança.",
          },
          {
            q: "E se faltar alguma coisa ou houver um erro?",
            a: "Sem problema — ajuste as quantidades diretamente na checklist. Os totais atualizam-se logo.",
          },
        ],
      },
      {
        heading: "Volume e veículo",
        items: [
          {
            q: "O que significam volume líquido e volume recomendado?",
            a: "O volume líquido é a soma dos objetos. O volume recomendado acrescenta 25% de espaço entre os móveis e é o valor a usar para escolher veículo ou arrecadação.",
          },
          {
            q: "De que veículo preciso?",
            a: "O relatório sugere um tamanho de veículo com base no volume recomendado. Também pode fazer as contas na nossa calculadora de carrinha de mudanças.",
          },
        ],
      },
      {
        heading: "Embalagem, armazenamento e entrega",
        items: [
          {
            q: "Posso pedir ajuda com a embalagem?",
            a: "Sim. No relatório assinala ajuda de embalagem, escolhe o nível de apoio e indica materiais como caixas, plástico-bolha, papel, fita, caixas de roupeiro, sacos para colchões e mantas para móveis.",
          },
          {
            q: "Precisamos de armazenamento intermédio. Onde o indico?",
            a: "Preencha a secção de armazenamento com o nome da empresa, morada completa e pessoa de contacto. Isso segue no relatório e no PDF.",
          },
          {
            q: "Onde adiciono a nova morada?",
            a: "Na secção de entrega à nova casa: morada completa, piso, se há elevador, distância de transporte e quaisquer notas.",
          },
        ],
      },
      {
        heading: "Partilha, idioma e PDF",
        items: [
          {
            q: "Posso guardar o relatório em vários idiomas?",
            a: "Sim. Escolha o idioma do relatório que fizer mais sentido para si. Tudo o que editar manualmente fica preservado — só os textos fixos mudam.",
          },
          {
            q: "Como partilho o relatório?",
            a: "Use “Partilhar link secreto”. Quem tiver o link pode ver o relatório sem iniciar sessão, por isso partilhe-o apenas com as pessoas certas.",
          },
          {
            q: "Como escondo o preço quando peço propostas?",
            a: "Ative o modo de concurso no relatório. Assim, o preço estimado e todos os cálculos desaparecem do ecrã, do PDF e do link partilhado.",
          },
        ],
      },
      {
        heading: "Para empresas de mudanças",
        items: [
          {
            q: "Podemos usar o nosso próprio logótipo e dados da empresa?",
            a: "Sim. No perfil da empresa adicionam logótipo, cor da marca, nome da empresa, número de registo, morada, telefone, e-mail e website. Tudo aparece no topo do relatório, no PDF e no cabeçalho quando têm sessão iniciada.",
          },
          {
            q: "Como definimos os preços?",
            a: "Introduzam o preço por m³ e a moeda no perfil da empresa. O relatório calcula o preço estimado automaticamente e, na vista empresarial, também podem trabalhar com preço por hora.",
          },
        ],
      },
      {
        heading: "Preços e privacidade",
        items: [
          {
            q: "Quanto custa?",
            a: "Os particulares podem experimentar grátis e comprar uma estimativa única ou um pacote de três. As empresas de mudanças têm a sua própria subscrição. Consulte a página de preços para ver os valores atuais.",
          },
          {
            q: "O que acontece ao meu vídeo da divisão?",
            a: "A sua estimativa baseia-se no vídeo da divisão e na checklist. O seu material mantém-se privado e é eliminado no máximo 12 meses após a última atividade. Se preferir remoção mais cedo, escreva-nos para kjell@volumcalc.com.",
          },
        ],
      },
    ],
  },
};

export const Route = createFileRoute("/hjelp")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Hjelp og FAQ / Help and FAQ — VolumCalc" },
      {
        name: "description",
        content:
          "Svar på de vanligste spørsmålene om VolumCalc: fotografering, rom, volum, pakking, lagring, deling, PDF, priser og personvern.",
      },
      { property: "og:title", content: "Hjelp og FAQ — VolumCalc" },
      { property: "og:description", content: "Alt du lurer på om volumberegning med VolumCalc." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const { lang } = useI18n();
  const c = content[lang] ?? content.en;
  useEffect(
    () => () => {
      document.getElementById("faq-schema")?.remove();
    },
    [],
  );
  useLocalizedMeta({
    title: `${c.title} — VolumCalc`,
    description: c.intro,
    jsonLdId: "faq-schema",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: c.groups.flatMap((group) =>
        group.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      ),
    },
  });

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
