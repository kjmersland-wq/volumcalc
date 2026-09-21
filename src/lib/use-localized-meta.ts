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
    let createdNode = false;
    let restoreText: string | null = null;
    let restoreManagedFlag = false;
    if (jsonLd) {
      node = document.getElementById(jsonLdId) as HTMLScriptElement | null;
      if (!node) {
        node = document.createElement("script");
        node.id = jsonLdId;
        node.type = "application/ld+json";
        document.head.appendChild(node);
        createdNode = true;
      } else {
        restoreText = node.textContent;
        restoreManagedFlag = node.dataset.localizedMeta === "true";
      }
      node.dataset.localizedMeta = "true";
      node.textContent = JSON.stringify(jsonLd);
    } else {
      const existing = document.getElementById(jsonLdId) as HTMLScriptElement | null;
      if (existing?.dataset.localizedMeta === "true") existing.remove();
    }

    return () => {
      if (!node) return;
      if (createdNode) {
        if (node.parentNode) node.parentNode.removeChild(node);
        return;
      }
      if (restoreManagedFlag) {
        node.dataset.localizedMeta = "true";
      } else {
        delete node.dataset.localizedMeta;
      }
      node.textContent = restoreText;
    };
  }, [description, jsonLd, jsonLdId, ogDescription, ogTitle, title]);
}
