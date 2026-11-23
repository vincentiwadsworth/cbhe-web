import { readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import puppeteer from "puppeteer";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const archivoMd = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "PROPUESTA-CBHE.md";
const RUTA_MD = join(raiz, archivoMd);
const RUTA_PDF = RUTA_MD.replace(/\.md$/, ".pdf");
const FUENTES = join(raiz, "node_modules", "@fontsource", "inter", "files");

const urlFuente = (peso) =>
  pathToFileURL(join(FUENTES, `inter-latin-${peso}-normal.woff2`)).href;

function inline(texto) {
  const marcas = [];
  const guardar = (html) => `\u0000${marcas.push(html) - 1}\u0000`;
  let salida = texto.replace(
    /<span class="(price|kpi)">([\s\S]*?)<\/span>/g,
    (_, clase, contenido) => guardar(`<span class="${clase}">${contenido}</span>`),
  );
  salida = salida.replace(/`([^`]+)`/g, (_, codigo) =>
    guardar(
      `<code>${codigo.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`,
    ),
  );
  salida = salida
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<![A-Za-z0-9])_([^_\n]+)_(?![A-Za-z0-9])/g, "<em>$1</em>")
    .replace(/(?<![*\w])\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  return salida.replace(/\u0000(\d+)\u0000/g, (_, i) => marcas[Number(i)]);
}

const empiezaBloque = (linea) =>
  !linea.trim() ||
  /^#{1,4}\s/.test(linea) ||
  /^\s*-\s+/.test(linea) ||
  /^\s*\d+\.\s+/.test(linea) ||
  /^\|/.test(linea) ||
  /^>/.test(linea) ||
  /^</.test(linea.trim()) ||
  /^-{3,}$/.test(linea.trim());

function mdToHtml(md) {
  const lineas = md.split(/\r?\n/);
  const salida = [];
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    if (!linea.trim()) {
      i++;
      continue;
    }

    if (/^<(p|div|span|table|h[1-6])\b/i.test(linea.trim())) {
      salida.push(linea.trim());
      i++;
      continue;
    }

    if (/^\|/.test(linea) && /^\|[\s:|-]+\|$/.test(lineas[i + 1] ?? "")) {
      const filas = [];
      while (i < lineas.length && /^\|/.test(lineas[i])) {
        filas.push(lineas[i]);
        i++;
      }
      const celdas = (f) => f.split("|").slice(1, -1).map((c) => c.trim());
      const alineacion = celdas(filas[1]).map((s) =>
        /^:-+:$/.test(s) ? "center" : /^-+:$/.test(s) ? "num" : "",
      );
      const clase = (n) => (alineacion[n] ? ` class="${alineacion[n]}"` : "");
      const cabecera = celdas(filas[0]);
      const cuerpo = filas.slice(2).map(celdas);
      const ultimo = salida[salida.length - 1] ?? "";
      const etiqueta = ultimo.match(/^<p><strong>(.+)<\/strong><\/p>$/);
      if (etiqueta) salida.pop();
      salida.push(
        "<table>" +
          (etiqueta ? `<caption>${etiqueta[1]}</caption>` : "") +
          "<thead><tr>" +
          cabecera.map((c, n) => `<th${clase(n)}>${inline(c)}</th>`).join("") +
          "</tr></thead><tbody>" +
          cuerpo
            .map(
              (f) =>
                "<tr>" +
                f.map((c, n) => `<td${clase(n)}>${inline(c)}</td>`).join("") +
                "</tr>",
            )
            .join("") +
          "</tbody></table>",
      );
      continue;
    }

    const titulo = linea.match(/^(#{1,4})\s+(.*)$/);
    if (titulo) {
      const n = titulo[1].length;
      salida.push(`<h${n}>${inline(titulo[2])}</h${n}>`);
      i++;
      continue;
    }

    if (/^-{3,}$/.test(linea.trim())) {
      salida.push("<hr>");
      i++;
      continue;
    }

    if (/^>/.test(linea)) {
      const items = [];
      while (i < lineas.length && /^>/.test(lineas[i])) {
        items.push(lineas[i].replace(/^>\s?/, "").replace(/\s+$/, ""));
        i++;
      }
      salida.push(`<p class="doc-subtitle">${inline(items.filter(Boolean).join(" · "))}</p>`);
      continue;
    }

    if (/^\s*(?:[-*]|\d+\.)\s+/.test(linea)) {
      const ordenada = /^\s*\d+\./.test(linea);
      const items = [];
      while (i < lineas.length) {
        const m = lineas[i].match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)$/);
        if (!m) break;
        if (/^\s*\d+\./.test(lineas[i]) !== ordenada) break;
        items.push({ texto: m[2], nivel: Math.min(2, Math.floor(m[1].length / 2)) });
        i++;
      }
      const etiqueta = ordenada ? "ol" : "ul";
      salida.push(
        `<${etiqueta}>` +
          items
            .map(({ texto, nivel }) =>
              `<li${nivel ? ` style="margin-left:${nivel * 16}pt"` : ""}>${inline(texto)}</li>`,
            )
            .join("") +
          `</${etiqueta}>`,
      );
      continue;
    }

    const parrafo = [];
    while (i < lineas.length && !empiezaBloque(lineas[i])) {
      parrafo.push(lineas[i].trim());
      i++;
    }
    salida.push(`<p>${inline(parrafo.join(" "))}</p>`);
  }
  return salida.join("\n");
}

function construirHtml(cuerpo, titulo) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
@font-face{font-family:'Inter';font-style:normal;font-weight:400;src:url('${urlFuente(400)}') format('woff2');}
@font-face{font-family:'Inter';font-style:normal;font-weight:500;src:url('${urlFuente(500)}') format('woff2');}
@font-face{font-family:'Inter';font-style:normal;font-weight:600;src:url('${urlFuente(600)}') format('woff2');}
@font-face{font-family:'Inter';font-style:normal;font-weight:700;src:url('${urlFuente(700)}') format('woff2');}
@page{size:A4;margin:30mm 25mm 26mm 25mm;}
:root{--c-bg:#ffffff;--c-ink:#1a1a1a;--c-muted:#6b7280;--c-rule:#e5e7eb;--c-brand:#002857;--c-accent:#ee7900;--c-th-bg:#f9fafb;}
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{font-family:"DM Sans","Inter",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:10.5pt;line-height:1.5;color:var(--c-ink);background:var(--c-bg);text-align:justify;hyphens:auto;-webkit-hyphens:auto;}
h1,h2,h3,h4{font-family:"DM Sans","Inter",system-ui,sans-serif;line-height:1.25;margin:0;padding:0;}
h1{font-size:22pt;font-weight:700;color:var(--c-brand);margin:0 0 6pt;letter-spacing:-.015em;line-height:1.15;text-wrap:balance;break-after:avoid;text-align:left;hyphens:none;}
.doc-subtitle{font-size:11.5pt;color:var(--c-muted);line-height:1.35;margin:0;padding-bottom:8pt;border-bottom:.6pt solid var(--c-rule);text-wrap:balance;text-align:left;hyphens:none;}
.doc-meta{font-size:9pt;font-weight:600;color:var(--c-brand);letter-spacing:.05em;text-transform:uppercase;margin:5pt 0 16pt;text-align:left;hyphens:none;}
h2{font-size:13pt;font-weight:700;color:#fff;background:var(--c-brand);padding:4pt 10pt;margin:18pt 0 8pt;break-after:avoid;text-align:left;hyphens:none;}
h3{font-size:11pt;font-weight:700;color:var(--c-ink);margin:12pt 0 4pt;break-after:avoid;text-align:left;hyphens:none;}
p{margin:0 0 7pt;orphans:2;widows:2;}
strong{font-weight:700;}
.kpi{color:var(--c-brand);font-weight:700;font-variant-numeric:tabular-nums;}
.price{color:var(--c-accent);font-weight:700;font-variant-numeric:tabular-nums;}
ul,ol{margin:0 0 8pt;padding-left:18px;}
li{margin-bottom:3pt;}
table{width:100%;border-collapse:collapse;margin:8pt 0 12pt;font-size:9.5pt;break-inside:avoid;}
thead th{background:var(--c-th-bg);color:var(--c-brand);font-weight:700;text-align:left;padding:5pt 8pt;border-top:1pt solid var(--c-brand);border-bottom:1pt solid var(--c-brand);}
tbody td{padding:5pt 8pt;border-bottom:.5pt solid var(--c-rule);vertical-align:top;}
th.num,td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}
thead{display:table-header-group;}
table:nth-of-type(2){break-inside:auto;}
caption{caption-side:top;text-align:left;font-weight:700;font-size:10pt;margin:0 0 4pt;hyphens:none;}
hr{border:none;border-top:.5pt solid var(--c-rule);margin:14pt 0;}
a{color:var(--c-brand);text-decoration:none;border-bottom:.5pt solid rgba(0,40,87,.35);}
code{font-family:"SFMono-Regular",Consolas,monospace;font-size:9pt;background:var(--c-th-bg);padding:0 2pt;border-radius:2pt;}
p,li,td{overflow-wrap:anywhere;}
td,th{text-align:left;}
th{white-space:nowrap;hyphens:none;}
</style>
</head>
<body>
${cuerpo}
</body>
</html>`;
}

async function generarPdf() {
  const md = readFileSync(RUTA_MD, "utf8");
  const titulo = (md.match(/^#\s+(.+)$/m)?.[1] ?? "Documento").trim();
  const html = construirHtml(mdToHtml(md), titulo);
  if (process.argv.includes("--html")) {
    const rutaHtml = RUTA_MD.replace(/\.md$/, ".html");
    writeFileSync(rutaHtml, html, "utf8");
    console.log("HTML generado: " + rutaHtml);
    return;
  }
  const navegador = await puppeteer.launch({ args: ["--font-render-hinting=none"] });
  try {
    const pagina = await navegador.newPage();
    await pagina.setContent(html, { waitUntil: "networkidle0" });
    await pagina.evaluate(() => document.fonts.ready.then(() => true));
    await pagina.pdf({
      path: RUTA_PDF,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate:
        "<div style=\"font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;color:#6b7280;width:100%;padding:0 25mm;text-align:right;\"><span class=\"pageNumber\"></span> de <span class=\"totalPages\"></span></div>",
    });
  } finally {
    await navegador.close();
  }
}

function verificar() {
  const assert = (cond, msg) => {
    if (!cond) {
      console.error("FALLO: " + msg);
      process.exit(1);
    }
  };
  const html = mdToHtml(readFileSync(RUTA_MD, "utf8"));
  const tablas = (html.match(/<table>/g) || []).length;
  const secciones = (html.match(/<h2>/g) || []).length;
  const subtitulos = (html.match(/<h3>/g) || []).length;
  assert(tablas === 3, `se esperaban 3 tablas, hay ${tablas}`);
  assert(secciones === 6, `se esperaban 6 secciones, hay ${secciones}`);
  assert(subtitulos === 3, `se esperaban 3 subtítulos, hay ${subtitulos}`);
  assert(/<ul>/.test(html), "faltan listas");
  assert(html.includes('<span class="price">USD 30</span>'), "falta el precio destacado");
  assert(/<td class="num">/.test(html), "falta la alineación numérica");
  assert(html.includes('<p class="doc-subtitle">'), "falta el subtítulo del encabezado");
  console.log("OK: 6 secciones, 3 subtítulos, 3 tablas, listas, precio y alineación");
}

if (process.argv.includes("--check")) {
  verificar();
} else {
  await generarPdf();
  const kb = Math.round(statSync(RUTA_PDF).size / 1024);
  console.log(`PDF generado: ${RUTA_PDF.replace(raiz + "\\", "")} (${kb} KB)`);
}
