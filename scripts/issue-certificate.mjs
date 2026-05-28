#!/usr/bin/env node

/**
 * issue-certificate.mjs — Issue a new CBHE certificate.
 *
 * Generates a unique code, inserts into Supabase, renders a PDF certificate,
 * and outputs the PDF + QR code PNG to a configurable output directory.
 *
 * Usage:
 *   node scripts/issue-certificate.mjs \
 *     --empresa "Empresa S.A." \
 *     --tipo "Inspección de Sistemas contra Incendios" \
 *     --fecha-emision 2025-01-15 \
 *     [--fecha-vencimiento 2026-01-15] \
 *     [--codigo CBHE-abc12345] \
 *     [--output ./output]
 *
 * Environment variables (required):
 *   VITE_SUPABASE_URL          — Supabase project URL
 *   SUPABASE_SECRET_KEY        — Supabase secret key (sb_secret_*)
 *   PUBLIC_VERIFICATION_URL    — Public base URL for QR codes (e.g. https://cbhe.org.bo)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import puppeteer from "puppeteer";

// ─── Config ──────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const VERIFICATION_URL = process.env.PUBLIC_VERIFICATION_URL;

// ─── Arg Parsing ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, "");
    if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
      args[key] = argv[++i];
    } else {
      args[key] = true;
    }
  }
  return args;
}

// ─── Code Generation ─────────────────────────────────────────────────────────

/**
 * Generate a URL-safe certificate code: CBHE-{10 random chars}
 * Uses crypto.randomBytes for better entropy than nanoid.
 */
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(10);
  let code = "CBHE-";
  for (let i = 0; i < 10; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// ─── Supabase REST ───────────────────────────────────────────────────────────

/**
 * Insert a certificate row into Supabase via PostgREST.
 * Returns the inserted row on success.
 */
async function insertCertificate({ codigo, empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento }) {
  const url = `${SUPABASE_URL}/rest/v1/certificados`;
  const body = {
    codigo,
    empresa_nombre,
    tipo_certificacion,
    fecha_emision,
    ...(fecha_vencimiento ? { fecha_vencimiento } : {}),
    estado: "vigente",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 409) {
      throw new Error(`DUPLICATE_CODE: Certificate code "${codigo}" already exists.`);
    }
    throw new Error(`Supabase INSERT failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Check if a code already exists in Supabase.
 */
async function codeExists(codigo) {
  const url = `${SUPABASE_URL}/rest/v1/certificados?codigo=eq.${codigo}&select=codigo`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) return false;
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

// ─── Date Formatting ─────────────────────────────────────────────────────────

function formatDateLong(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── QR Generation ───────────────────────────────────────────────────────────

async function generateQRDataURL(verificationUrl) {
  const base64 = await QRCode.toDataURL(verificationUrl, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#01406c",
      light: "#ffffff",
    },
  });
  return base64;
}

async function generateQRBuffer(verificationUrl) {
  return QRCode.toBuffer(verificationUrl, {
    width: 600,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#01406c",
      light: "#ffffff",
    },
  });
}

// ─── Logo Base64 ─────────────────────────────────────────────────────────────

function getLogoBase64() {
  const logoPath = resolve(ROOT, "public", "logo-cbhe.png");
  if (!existsSync(logoPath)) {
    throw new Error(`Logo not found at ${logoPath}`);
  }
  const buf = readFileSync(logoPath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

// ─── HTML Template Rendering ─────────────────────────────────────────────────

function renderTemplate({ empresa, tipo, fechaEmision, fechaVencimiento, codigo, qrBase64, logoBase64 }) {
  const templatePath = resolve(ROOT, "templates", "certificate.html");
  let html = readFileSync(templatePath, "utf-8");

  // Build the optional vencimiento block
  const vencimientoBlock = fechaVencimiento
    ? `<div class="certificate-date-item">
        <p class="certificate-date-label">Fecha de Vencimiento</p>
        <p class="certificate-date-value">${fechaVencimiento}</p>
      </div>`
    : "";

  html = html
    .replace(/\{\{LOGO_BASE64\}\}/g, logoBase64)
    .replace(/\{\{EMPRESA\}\}/g, empresa)
    .replace(/\{\{TIPO\}\}/g, tipo)
    .replace(/\{\{FECHA_EMISION\}\}/g, fechaEmision)
    .replace(/\{\{FECHA_VENCIMIENTO_BLOCK\}\}/g, vencimientoBlock)
    .replace(/\{\{QR_BASE64\}\}/g, qrBase64)
    .replace(/\{\{CODIGO\}\}/g, codigo);

  return html;
}

// ─── PDF Generation ──────────────────────────────────────────────────────────

async function generatePDF(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Validate env vars
  if (!SUPABASE_URL) {
    console.error("ERROR: VITE_SUPABASE_URL environment variable is required.");
    process.exit(1);
  }
  if (!SUPABASE_KEY) {
    console.error("ERROR: SUPABASE_SECRET_KEY environment variable is required.");
    process.exit(1);
  }
  if (!VERIFICATION_URL) {
    console.error("ERROR: PUBLIC_VERIFICATION_URL environment variable is required.");
    process.exit(1);
  }

  const args = parseArgs(process.argv);

  // Validate required args
  const empresa_nombre = args["empresa"];
  const tipo_certificacion = args["tipo"];
  const fecha_emision = args["fecha-emision"];

  if (!empresa_nombre) {
    console.error("ERROR: --empresa is required.");
    console.error("Usage: node scripts/issue-certificate.mjs --empresa \"Name\" --tipo \"Type\" --fecha-emision 2025-01-15 [--fecha-vencimiento 2026-01-15] [--codigo CBHE-xxx] [--output ./output]");
    process.exit(1);
  }
  if (!tipo_certificacion) {
    console.error("ERROR: --tipo is required.");
    process.exit(1);
  }
  if (!fecha_emision) {
    console.error("ERROR: --fecha-emision is required (YYYY-MM-DD format).");
    process.exit(1);
  }

  const fecha_vencimiento = args["fecha-vencimiento"] || null;
  const outputDir = resolve(args["output"] || "./output");

  // Generate or use provided code
  let codigo = args["codigo"];
  if (!codigo) {
    // Generate unique code with collision retry (max 5 attempts)
    for (let attempt = 0; attempt < 5; attempt++) {
      codigo = generateCode();
      const exists = await codeExists(codigo);
      if (!exists) break;
      console.warn(`Code collision on attempt ${attempt + 1}, regenerating...`);
      codigo = null;
    }
    if (!codigo) {
      console.error("ERROR: Failed to generate a unique code after 5 attempts.");
      process.exit(1);
    }
  }

  const verificationUrl = `${VERIFICATION_URL}/certificados/?c=${codigo}`;

  console.log("─".repeat(60));
  console.log("CBHE Certificate Issuance");
  console.log("─".repeat(60));
  console.log(`  Code:       ${codigo}`);
  console.log(`  Empresa:    ${empresa_nombre}`);
  console.log(`  Tipo:       ${tipo_certificacion}`);
  console.log(`  Emisión:    ${fecha_emision}`);
  console.log(`  Vencimiento: ${fecha_vencimiento || "N/A"}`);
  console.log(`  Verify URL: ${verificationUrl}`);
  console.log("─".repeat(60));

  // Step 1: Insert into Supabase
  console.log("Step 1/4: Inserting into Supabase...");
  const row = await insertCertificate({
    codigo,
    empresa_nombre,
    tipo_certificacion,
    fecha_emision,
    fecha_vencimiento,
  });
  console.log(`  ✓ Inserted (id: ${row.id})`);

  // Step 2: Generate QR code
  console.log("Step 2/4: Generating QR code...");
  const qrDataURL = await generateQRDataURL(verificationUrl);
  const qrBuffer = await generateQRBuffer(verificationUrl);

  // Step 3: Render HTML template
  console.log("Step 3/4: Rendering certificate HTML...");
  const fechaEmisionFormatted = formatDateLong(fecha_emision);
  const fechaVencimientoFormatted = fecha_vencimiento ? formatDateLong(fecha_vencimiento) : null;
  const logoBase64 = getLogoBase64();

  const html = renderTemplate({
    empresa: empresa_nombre,
    tipo: tipo_certificacion,
    fechaEmision: fechaEmisionFormatted,
    fechaVencimiento: fechaVencimientoFormatted,
    codigo,
    qrBase64: qrDataURL,
    logoBase64,
  });

  // Step 4: Generate PDF
  console.log("Step 4/4: Generating PDF...");
  const pdf = await generatePDF(html);

  // Save outputs
  mkdirSync(outputDir, { recursive: true });
  const pdfPath = resolve(outputDir, `${codigo}.pdf`);
  const qrPath = resolve(outputDir, `${codigo}-qr.png`);
  const htmlPath = resolve(outputDir, `${codigo}.html`);

  writeFileSync(pdfPath, pdf);
  writeFileSync(qrPath, qrBuffer);
  writeFileSync(htmlPath, html);

  console.log("─".repeat(60));
  console.log("✓ Certificate issued successfully!");
  console.log(`  PDF:  ${pdfPath}`);
  console.log(`  QR:   ${qrPath}`);
  console.log(`  HTML: ${htmlPath}`);
  console.log("─".repeat(60));
  console.log();
  console.log(`Verification URL: ${verificationUrl}`);
  console.log(`Certificate code: ${codigo}`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
