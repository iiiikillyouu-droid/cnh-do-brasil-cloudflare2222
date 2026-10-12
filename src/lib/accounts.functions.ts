import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accountEmail, createAccountSchema, editAccountSchema } from "./account-validation";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type AccountRow = { id: string; cpf: string | null; full_name: string; created_at: string; category: string | null; uf: string | null; validade: string | null; emissao: string | null; sexo: string | null };

export const listAccounts = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !allowed) throw new Error("Acesso restrito a administradores.");
  const withSexo = await context.supabase.from("profiles").select("id, cpf, full_name, created_at, category, uf, validade, emissao, sexo").order("created_at", { ascending: false });
  if (!withSexo.error) return withSexo.data as unknown as AccountRow[];
  // Coluna sexo ainda não existe no banco: lista sem ela para não quebrar o painel.
  const { data, error } = await context.supabase.from("profiles").select("id, cpf, full_name, created_at, category, uf, validade, emissao").order("created_at", { ascending: false });
  if (error) throw new Error("Não foi possível carregar os cadastros.");
  return (data ?? []).map(row => ({ ...row, sexo: null })) as AccountRow[];
});
export const createAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(input => createAccountSchema.parse(input)).handler(async ({ data, context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !allowed) throw new Error("Acesso restrito a administradores.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: account, error } = await supabaseAdmin.auth.admin.createUser({ email: accountEmail(data.cpf), password: data.password, email_confirm: true });
  if (error || !account.user) throw new Error("Não foi possível cadastrar. Confira se o CPF já possui acesso.");
  const base = { cpf: data.cpf, full_name: data.fullName, category: data.category, uf: data.uf.toUpperCase(), validade: data.validade, emissao: data.emissao };
  let { error: profileError } = await supabaseAdmin.from("profiles").update({ ...base, sexo: data.sexo || null } as unknown as ProfileUpdate).eq("id", account.user.id);
  let sexoSaved = true;
  if (profileError && /sexo/.test(profileError.message ?? "")) {
    // Coluna sexo ainda não existe no banco: salva os demais campos e avisa.
    sexoSaved = false;
    ({ error: profileError } = await supabaseAdmin.from("profiles").update(base).eq("id", account.user.id));
  }
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(account.user.id);
    throw new Error("Não foi possível salvar o cadastro.");
  }
  return { ok: true, id: account.user.id, sexoSaved };
});
export const editAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(input => editAccountSchema.parse(input)).handler(async ({ data, context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !allowed) throw new Error("Acesso restrito a administradores.");
  const { data: existing, error: readError } = await context.supabase.from("profiles").select("id").eq("id", data.id).single();
  if (readError || !existing) throw new Error("Cadastro não encontrado.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (data.password) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, { password: data.password });
    if (error) throw new Error("Não foi possível alterar a senha.");
  }
  const base = { full_name: data.fullName, category: data.category, uf: data.uf.toUpperCase(), validade: data.validade, emissao: data.emissao };
  let { error } = await supabaseAdmin.from("profiles").update({ ...base, sexo: data.sexo || null } as unknown as ProfileUpdate).eq("id", data.id);
  let sexoSaved = true;
  if (error && /sexo/.test(error.message ?? "")) {
    // Coluna sexo ainda não existe no banco: salva os demais campos e avisa.
    sexoSaved = false;
    ({ error } = await supabaseAdmin.from("profiles").update(base).eq("id", data.id));
  }
  if (error) throw new Error("Não foi possível salvar o cadastro.");
  return { ok: true, sexoSaved };
});
export const deleteAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !allowed) throw new Error("Acesso restrito a administradores.");
  if (data.id === context.userId) throw new Error("Você não pode apagar a própria conta.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: docs } = await supabaseAdmin.from("cnh_documents").select("storage_path").eq("user_id", data.id);
  const paths = (docs ?? []).map(d => d.storage_path).filter((p): p is string => Boolean(p));
  if (paths.length) await supabaseAdmin.storage.from("cnh-documents").remove(paths);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
  if (error) throw new Error("Não foi possível apagar o cadastro.");
  return { ok: true };
});
