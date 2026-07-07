/**
 * generate-qr — Supabase Edge Function (Deno)
 *
 * Triggered by Database Webhooks on INSERT into capacitacion or sello.
 * Generates a QR PNG encoding the public verification URL, uploads it
 * to the certificados-qr Storage bucket, and UPDATEs the triggering
 * row with the public URL.
 *
 * Deploy: supabase functions deploy generate-qr
 * Secrets: PUBLIC_VERIFICATION_URL (set via supabase secrets set)
 * Required Deno flags: --allow-net --allow-env
 */

import QRCode from "https://esm.sh/qrcode@1.5.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface WebhookPayload {
  record: {
    id: string;
    codigo: string;
    [key: string]: unknown;
  };
  table: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // Step 1 — Parse & validate payload
    console.log("[generate-qr] Received webhook request");

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }

    let payload: WebhookPayload;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { record, table } = payload;

    if (!record?.id || !record?.codigo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: record.id, record.codigo",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (table !== "capacitacion" && table !== "sello") {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid table: "${table}". Expected "capacitacion" or "sello".`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(
      `[generate-qr] Valid payload — table: "${table}", id: ${record.id}, codigo: ${record.codigo}`,
    );

    // Step 2 — Build verification URL
    const baseUrl =
      Deno.env.get("PUBLIC_VERIFICATION_URL") || "https://cbhe.org.bo";
    const verificationUrl =
      `${baseUrl}/certificados/?c=${encodeURIComponent(record.codigo)}`;

    // Step 3 — Generate QR PNG
    console.log("[generate-qr] Generating QR PNG for:", verificationUrl);
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    // Step 4 — Supabase service-role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "[generate-qr] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server misconfiguration: missing env vars",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Step 5 — Upload to Storage bucket + UPDATE row (with retry)
    const filename = `${record.codigo}.png`;
    const retryDelays = [0, 1000, 2000]; // 3 attempts: immediate, 1s, 2s

    for (let attempt = 0; attempt < retryDelays.length; attempt++) {
      if (attempt > 0) {
        console.log(
          `[generate-qr] Retry attempt ${attempt + 1}/${retryDelays.length} after ${retryDelays[attempt]}ms`,
        );
        await sleep(retryDelays[attempt]);
      }

      try {
        // 5a — Upload PNG to Storage
        console.log(
          `[generate-qr] Uploading "${filename}" to bucket certificados-qr`,
        );
        const { error: uploadError } = await supabase.storage
          .from("certificados-qr")
          .upload(filename, qrBuffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.error("[generate-qr] Upload error:", uploadError);
          continue; // retry
        }

        // 5b — Get public URL
        const { data: urlData } = supabase.storage
          .from("certificados-qr")
          .getPublicUrl(filename);

        // 5c — UPDATE the triggering row
        console.log(
          `[generate-qr] Updating ${table}.qr_url for id=${record.id}`,
        );
        const { error: updateError } = await supabase
          .from(table)
          .update({ qr_url: urlData.publicUrl })
          .eq("id", record.id);

        if (updateError) {
          console.error("[generate-qr] Update error:", updateError);
          continue; // retry
        }

        // Success!
        console.log(
          `[generate-qr] Done — qr_url set to ${urlData.publicUrl}`,
        );
        return new Response(
          JSON.stringify({ success: true, url: urlData.publicUrl }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      } catch (err) {
        console.error(
          `[generate-qr] Attempt ${attempt + 1} failed:`,
          err instanceof Error ? err.message : err,
        );
        // continue to next retry attempt
      }
    }

    // All retries exhausted
    console.error(
      `[generate-qr] FAILED after ${retryDelays.length} attempts for codigo=${record.codigo}`,
    );
    return new Response(
      JSON.stringify({
        success: false,
        error:
          `QR generation failed after ${retryDelays.length} attempts. Row qr_url remains NULL. ` +
          "Retry manually via Dashboard → Database → Webhooks → Logs → Retry.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(
      "[generate-qr] Unexpected error:",
      err instanceof Error ? err.message : err,
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
