import { useEffect } from "react";

type MetaOptions = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  jsonLd?: Record<string, unknown>;
  jsonLdId?: string;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attr, key);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

export function useLocalizedMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  jsonLd,
  jsonLdId = "localized-jsonld",
}: MetaOptions) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", ogTitle ?? title);
    upsertMeta("property", "og:description", ogDescription ?? description);

    let node: HTMLScriptElement | null = null;
    if (jsonLd) {
      node = document.getElementById(jsonLdId) as HTMLScriptElement | null;
      if (!node) {
        node = document.createElement("script");
        node.id = jsonLdId;
        node.type = "application/ld+json";
        document.head.appendChild(node);
      }
      node.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      if (node?.parentNode) node.parentNode.removeChild(node);
    };
  }, [description, jsonLd, jsonLdId, ogDescription, ogTitle, title]);
}
