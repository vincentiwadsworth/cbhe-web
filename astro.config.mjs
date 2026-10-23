// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri"; // shortcut: dependencia directa de astro 7.3.5, si astro la saca hay que instalarla

// Un <img> con `title` dentro de un párrafo se renderiza como <figure> con ese texto de pie de foto; los párrafos con varias imágenes o sin title no cambian. Es el equivalente Sätteri de un plugin rehype (ver markdown-content#plugins).
/** @type {import("satteri").HastPluginDefinition} */
const figureCaption = {
  name: "figure-caption",
  element: {
    filter: ["p"],
    visit(node, ctx) {
      // Los tipos de satteri no narrowean el contenido del párrafo; el shape del nodo lo valida el renderer, así que se opera sobre el nodo suelto.
      const parrafo = /** @type {any} */ (node);
      /** @param {any} child */
      const esImagen = (child) => child.type === "element" && child.tagName === "img";
      /** @param {any} child */
      const noEsImagenNiTextoVacio = (child) =>
        child !== images[0] && !(child.type === "text" && !String(child.value ?? "").trim());
      /** @type {any[]} */
      const images = parrafo.children.filter(esImagen);
      const title = images.length === 1 && images[0].properties?.title;

      if (typeof title !== "string" || !title.trim()) return;

      const { title: _title, ...properties } = images[0].properties ?? {};
      /** @type {any[]} */
      const rest = parrafo.children.filter(noEsImagenNiTextoVacio);
      const figure = {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          { type: "element", tagName: "img", properties, children: [] },
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: title }],
          },
        ],
      };

      // <figure> no es contenido válido dentro de <p>: se reemplaza el párrafo, y el texto que lo acompañaba se conserva en un párrafo propio.
      ctx.replaceNode(
        node,
        /** @type {any} */ (
          rest.length
            ? [figure, { type: "element", tagName: "p", properties: parrafo.properties, children: rest }]
            : figure
        ),
      );
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://cbhe.org.bo",
  base: "/",
  // Astro 7 defaults to compressHTML: 'jsx', which strips whitespace between inline elements (icon+text buttons breaks). Keep the v6 HTML-aware behavior.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/gracias") &&
        !page.includes("/certificados") &&
        !page.includes("/documentos-internos"),
    }),
    icon({
      include: {
        "material-symbols": [
          "bolt",
          "search",
          "arrow-back",
          "arrow-forward",
          "explore",
          "engineering",
          "factory",
          "local-shipping",
          "handyman",
          "check-circle",
          "send",
          "flag",
          "visibility",
          "landscape",
          "precision-manufacturing",
          "route",
          "support-agent",
          "school",
          "arrow-downward",
          "calendar-today",
          "schedule",
          "desktop-windows",
          "apartment",
          "devices",
          "refresh",
          "verified",
          "security",
          "account-balance",
          "science",
          "language",
          "architecture",
          "category",
          "history",
          "expand-more",
          "menu",
          "close",
          "location-on",
          "call",
          "mail",
          "map",
          "open-in-new",
          "chat",
          "description",
          "gavel",
          "fact-check",
          "groups",
          "payments",
          "task-alt",
          "oil-barrel",
          "local-fire-department",
          "euro",
          "currency-exchange",
          "qr-code-2",
          "palette",
          "light-mode",
          "dark-mode",
          "format-quote",
          "person",
          "sort-by-alpha",
        ],
      },
    }),
  ],
  markdown: {
    processor: satteri({ hastPlugins: [figureCaption] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
