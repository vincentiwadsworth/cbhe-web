/**
 * asistente — Supabase Edge Function (Deno)
 *
 * Proxy server-side para el asistente virtual de la CBHE.
 * La clave de OpenRouter vive en el entorno de Supabase (secret) y nunca
 * llega al navegador. El sitio estático llama a esta función; esta función
 * llama a OpenRouter y devuelve el stream al cliente.
 *
 * Deploy:  supabase functions deploy asistente --no-verify-jwt
 * Secret:  supabase secrets set OPENROUTER_API_KEY=...
 * Opcional: supabase secrets set OPENROUTER_MODELO=nvidia/nemotron-3-ultra-550b-a55b:free
 */

const ORIGENES_PERMITIDOS = [
  "https://vincentiwadsworth.github.io",
  "https://cbhe.org.bo",
  "https://www.cbhe.org.bo",
];

const ENDPOINT_OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";
const MODELO_POR_DEFECTO = "nvidia/nemotron-3-ultra-550b-a55b:free";
const REFERENTE_SITIO = "https://cbhe.org.bo";
const TITULO_APP = "CBHE";

const MAX_MENSAJES = 40;
const MAX_CARACTERES_POR_MENSAJE = 20000;
const MAX_CARACTERES_TOTAL = 60000;
const MAX_TOKENS_TOPE = 1024;

type Rol = "system" | "user" | "assistant";

interface MensajeEntrada {
  role: Rol;
  content: string;
}

/** Cabeceras CORS; solo refleja el origen si está en la lista permitida. */
function cabecerasCors(req: Request): Record<string, string> {
  const origen = req.headers.get("origin") ?? "";
  const cabeceras: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  if (ORIGENES_PERMITIDOS.includes(origen)) {
    cabeceras["Access-Control-Allow-Origin"] = origen;
  }
  return cabeceras;
}

function respuestaJson(
  cuerpo: unknown,
  estado: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/** Valida y normaliza los mensajes entrantes. Devuelve un error (string) o la lista limpia. */
function validarMensajes(valor: unknown): MensajeEntrada[] | string {
  if (!Array.isArray(valor) || valor.length === 0) {
    return "Falta el arreglo 'messages'.";
  }
  if (valor.length > MAX_MENSAJES) {
    return `Demasiados mensajes (máximo ${MAX_MENSAJES}).`;
  }
  let total = 0;
  const limpios: MensajeEntrada[] = [];
  for (const item of valor) {
    if (typeof item !== "object" || item === null) {
      return "Mensaje inválido.";
    }
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "system" && role !== "user" && role !== "assistant") {
      return "Rol de mensaje inválido.";
    }
    if (typeof content !== "string" || content.length === 0) {
      return "Contenido de mensaje inválido.";
    }
    if (content.length > MAX_CARACTERES_POR_MENSAJE) {
      return "Mensaje demasiado largo.";
    }
    total += content.length;
    if (total > MAX_CARACTERES_TOTAL) {
      return "Conversación demasiado larga.";
    }
    limpios.push({ role, content });
  }
  return limpios;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = cabecerasCors(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return respuestaJson({ error: "Método no permitido" }, 405, cors);
  }

  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return respuestaJson({ error: "JSON inválido" }, 400, cors);
  }

  const entrada = cuerpo as {
    messages?: unknown;
    maxTokens?: unknown;
    temperature?: unknown;
  };

  const validacion = validarMensajes(entrada?.messages);
  if (typeof validacion === "string") {
    return respuestaJson({ error: validacion }, 400, cors);
  }

  const clave = Deno.env.get("OPENROUTER_API_KEY");
  if (!clave) {
    console.error("[asistente] Falta el secret OPENROUTER_API_KEY");
    return respuestaJson(
      { error: "Configuración del servidor incompleta" },
      500,
      cors,
    );
  }

  const modelo = Deno.env.get("OPENROUTER_MODELO") ?? MODELO_POR_DEFECTO;
  const maxTokens = Math.min(
    typeof entrada?.maxTokens === "number" ? entrada.maxTokens : MAX_TOKENS_TOPE,
    MAX_TOKENS_TOPE,
  );
  const temperature =
    typeof entrada?.temperature === "number" ? entrada.temperature : 0.7;

  let respuestaProveedor: Response;
  try {
    respuestaProveedor = await fetch(ENDPOINT_OPENROUTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clave}`,
        // OpenRouter atribuye el consumo a la app con estos dos headers.
        "HTTP-Referer": REFERENTE_SITIO,
        "X-Title": TITULO_APP,
      },
      body: JSON.stringify({
        model: modelo,
        messages: validacion,
        stream: true,
        max_tokens: maxTokens,
        temperature,
      }),
    });
  } catch (err) {
    console.error(
      "[asistente] Error al contactar OpenRouter:",
      err instanceof Error ? err.message : err,
    );
    return respuestaJson(
      { error: "No se pudo contactar al proveedor de IA." },
      502,
      cors,
    );
  }

  if (!respuestaProveedor.ok || !respuestaProveedor.body) {
    const detalle = await respuestaProveedor.text().catch(() => "");
    console.error(
      "[asistente] OpenRouter respondió",
      respuestaProveedor.status,
      detalle.slice(0, 500),
    );
    return respuestaJson(
      { error: "El proveedor de IA devolvió un error." },
      502,
      cors,
    );
  }

  return new Response(respuestaProveedor.body, {
    status: 200,
    headers: {
      ...cors,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
