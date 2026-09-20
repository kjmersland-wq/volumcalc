export function socialImageMeta(lang?: "no" | "en") {
  const norwegian = lang === "no";
  const image = norwegian
    ? "https://volumcalc.com/og-volumcalc-no.jpg"
    : "https://volumcalc.com/og-volumcalc-en.jpg";

  return [
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    {
      property: "og:image:alt",
      content: norwegian
        ? "VolumCalc – romvis volumberegning fra bilder"
        : "VolumCalc — room-by-room volume estimates from photos",
    },
    { name: "twitter:image", content: image },
    {
      name: "twitter:image:alt",
      content: norwegian
        ? "VolumCalc – romvis volumberegning fra bilder"
        : "VolumCalc — room-by-room volume estimates from photos",
    },
  ];
}