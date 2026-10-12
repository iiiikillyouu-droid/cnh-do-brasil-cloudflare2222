export function cnhHead(title: string, description: string) {
  return { meta: [{ title: `${title} — CNH do Brasil` }, { name: "description", content: description }, { property: "og:title", content: `${title} — CNH do Brasil` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
}