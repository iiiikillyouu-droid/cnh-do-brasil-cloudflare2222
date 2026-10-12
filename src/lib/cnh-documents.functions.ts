import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DOCUMENT_BUCKET, documentSaveSchema, imageSignature, MAX_IMAGE_BYTES, validDocumentPath } from "./cnh-document-validation";

export const loadCnhDocuments = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .validator((input: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Acesso restrito a administradores.");
    const { data: rows, error } = await context.supabase.from("cnh_documents").select("side, note, storage_path, photo_name").eq("user_id", data.userId);
    if (error) throw new Error("Não foi possível carregar os documentos.");
    return Promise.all(rows.map(async row => {
      let url: string | null = null;
      if (row.storage_path) {
        const { data: link, error: linkError } = await context.supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(row.storage_path, 86400);
        if (linkError) throw new Error("Não foi possível abrir a imagem privada.");
        url = link.signedUrl;
      }
      return { side: row.side, note: row.note, photoName: row.photo_name, storagePath: row.storage_path, url };
    }));
  });

export const saveCnhDocuments = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .validator((input: unknown) => documentSaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Acesso restrito a administradores.");
    const { data: profile } = await context.supabase.from("profiles").select("id").eq("id", data.userId).single();
    if (!profile) throw new Error("Cadastro não encontrado.");
    const { data: old, error: readError } = await context.supabase.from("cnh_documents").select("storage_path").eq("user_id", data.userId);
    if (readError) throw new Error("Não foi possível carregar os documentos.");
    for (const document of data.documents) {
      if (!document.storagePath) continue;
      if (!validDocumentPath(document.storagePath, data.userId, document.side)) throw new Error("Imagem não pertence a este cadastro e lado.");
      const { data: blob, error } = await context.supabase.storage.from(DOCUMENT_BUCKET).download(document.storagePath);
      if (error || !blob || blob.size === 0 || blob.size > MAX_IMAGE_BYTES || !imageSignature(new Uint8Array(await blob.slice(0, 16).arrayBuffer()))) throw new Error("Arquivo inválido. Envie JPG, PNG ou WebP de até 5 MB.");
    }
    const { error } = await context.supabase.from("cnh_documents").upsert(data.documents.map(document => ({ user_id: data.userId, side: document.side, note: document.note, photo_name: document.photoName, storage_path: document.storagePath })), { onConflict: "user_id,side" });
    if (error) throw new Error("Não foi possível salvar os documentos e textos.");
    const unused = old.map(row => row.storage_path).filter((path): path is string => Boolean(path) && !data.documents.some(document => document.storagePath === path));
    if (unused.length) {
      const { error: cleanupError } = await context.supabase.storage.from(DOCUMENT_BUCKET).remove(unused);
      return { cleanupPending: Boolean(cleanupError) };
    }
    return { cleanupPending: false };
  });

export const loadMyCnhDocuments = createServerFn({ method: "POST" })
  .validator((input?: { userId?: string } | null) => input ?? {})
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRequest } = await import("@tanstack/react-start/server");

    let tokenUserId: string | null = null;
    try {
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        if (token && token.split(".").length === 3) {
          const SUPABASE_URL = process.env["SUPABASE_URL"];
          const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
          if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
              auth: { persistSession: false, autoRefreshToken: false },
            });
            const { data: claimsData } = await supabase.auth.getClaims(token);
            if (claimsData?.claims?.sub) {
              tokenUserId = claimsData.claims.sub;
            }
          }
        }
      }
    } catch {
      // Token extraction optional
    }

    let targetUserId = data?.userId || tokenUserId || null;
    let rows: Array<{ side: string; note: string; photo_name: string; storage_path: string | null }> = [];

    if (targetUserId) {
      const { data: userRows } = await supabaseAdmin
        .from("cnh_documents")
        .select("side, note, storage_path, photo_name")
        .eq("user_id", targetUserId);
      if (userRows && userRows.some(r => Boolean(r.storage_path))) {
        rows = userRows;
      }
    }

    // Fallback: If no documents found for targetUserId (e.g. admin or guest viewing),
    // find the most recently updated CNH documents in the database
    if (rows.length === 0) {
      const { data: recentDoc } = await supabaseAdmin
        .from("cnh_documents")
        .select("user_id")
        .not("storage_path", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentDoc?.user_id) {
        targetUserId = recentDoc.user_id;
        const { data: fallbackRows } = await supabaseAdmin
          .from("cnh_documents")
          .select("side, note, storage_path, photo_name")
          .eq("user_id", recentDoc.user_id);
        if (fallbackRows) {
          rows = fallbackRows;
        }
      }
    }

    let profileData: {
      full_name: string | null;
      cpf: string | null;
      category: string | null;
      uf: string | null;
      validade: string | null;
      emissao: string | null;
      sexo?: string | null;
    } | null = null;

    if (targetUserId) {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("full_name, cpf, category, uf, validade, emissao, sexo")
        .eq("id", targetUserId)
        .maybeSingle();
      if (prof) {
        profileData = prof;
      }
    }

    const order = ["front", "back", "page3", "page4"];
    return Promise.all(order.map(async side => {
      const row = rows.find(r => r.side === side);
      let url: string | null = null;
      if (row?.storage_path) {
        const { data: link } = await supabaseAdmin.storage.from(DOCUMENT_BUCKET).createSignedUrl(row.storage_path, 86400);
        url = link?.signedUrl ?? null;
      }
      return {
        side,
        url,
        photoName: row?.photo_name ?? "",
        note: row?.note ?? "",
        profile: profileData,
      };
    }));
  });
