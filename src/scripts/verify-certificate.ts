/**
 * verify-certificate.ts — Client-side certificate verification logic.
 *
 * Extracts the `c` query parameter from the URL, queries Supabase
 * for a matching certificate, and updates the DOM to show the result.
 *
 * Three states: loading → found | not-found | error
 */
import { createSupabaseClient } from "../lib/supabase";

// Types for certificate data
interface CertificateData {
  empresa_nombre: string;
  tipo_certificacion: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: string;
  codigo: string;
}

// DOM element references
const loadingEl = document.getElementById("cert-loading");
const foundEl = document.getElementById("cert-found");
const notFoundEl = document.getElementById("cert-not-found");
const errorEl = document.getElementById("cert-error");
const codeDisplayEl = document.getElementById("cert-code-display");

function hideAll(): void {
  loadingEl?.classList.add("hidden");
  foundEl?.classList.add("hidden");
  notFoundEl?.classList.add("hidden");
  errorEl?.classList.add("hidden");
}

function showState(state: "loading" | "found" | "not-found" | "error"): void {
  hideAll();
  switch (state) {
    case "loading":
      loadingEl?.classList.remove("hidden");
      break;
    case "found":
      foundEl?.classList.remove("hidden");
      break;
    case "not-found":
      notFoundEl?.classList.remove("hidden");
      break;
    case "error":
      errorEl?.classList.remove("hidden");
      break;
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-BO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function populateCard(cert: CertificateData): void {
  const empresaEl = document.getElementById("cert-empresa");
  const tipoEl = document.getElementById("cert-tipo");
  const emisionEl = document.getElementById("cert-emision");
  const vencimientoEl = document.getElementById("cert-vencimiento");
  const vencimientoContainer = document.getElementById("cert-vencimiento-container");
  const codigoEl = document.getElementById("cert-codigo");
  const estadoIcon = document.getElementById("cert-estado-icon");
  const estadoTitle = document.getElementById("cert-estado-title");
  const estadoDesc = document.getElementById("cert-estado-desc");
  const headerEl = document.getElementById("cert-header");

  if (empresaEl) empresaEl.textContent = cert.empresa_nombre;
  if (tipoEl) tipoEl.textContent = cert.tipo_certificacion;
  if (emisionEl) emisionEl.textContent = formatDate(cert.fecha_emision);
  if (codigoEl) codigoEl.textContent = cert.codigo;

  if (cert.fecha_vencimiento) {
    if (vencimientoEl) vencimientoEl.textContent = formatDate(cert.fecha_vencimiento);
    vencimientoContainer?.classList.remove("hidden");
  } else {
    vencimientoContainer?.classList.add("hidden");
  }

  // Update status-dependent elements
  const isVigente = cert.estado === "vigente";

  if (estadoIcon) {
    estadoIcon.setAttribute("name", isVigente ? "material-symbols:verified" : "material-symbols:security");
    estadoIcon.className = `size-8 shrink-0 ${isVigente ? "text-success" : "text-error"}`;
  }

  if (estadoTitle) {
    estadoTitle.textContent = isVigente ? "Certificado Verificado" : `Certificado ${cert.estado === "vencido" ? "Vencido" : "Revocado"}`;
  }

  if (estadoDesc) {
    estadoDesc.textContent = isVigente
      ? "Este certificado es válido y está vigente."
      : "Este certificado no está vigente.";
  }

  if (headerEl) {
    headerEl.className = `px-6 py-4 flex items-center gap-3 ${isVigente ? "bg-success/10" : "bg-error/10"}`;
  }
}

async function verifyCertificate(codigo: string): Promise<void> {
  if (codeDisplayEl) codeDisplayEl.textContent = codigo;
  showState("loading");

  try {
    const supabase = createSupabaseClient();
    const { data, error: dbError } = await supabase
      .from("certificados")
      .select("empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento, estado, codigo")
      .eq("codigo", codigo)
      .maybeSingle();

    if (dbError) {
      console.error("Supabase query error:", dbError);
      showState("error");
      return;
    }

    if (!data) {
      showState("not-found");
      return;
    }

    populateCard(data as CertificateData);
    showState("found");
  } catch (err) {
    console.error("Verification error:", err);
    showState("error");
  }
}

// Extract code from URL query parameter `c`
const params = new URLSearchParams(window.location.search);
const codigo = params.get("c")?.trim();

if (!codigo) {
  showState("not-found");
} else {
  verifyCertificate(codigo);
}
