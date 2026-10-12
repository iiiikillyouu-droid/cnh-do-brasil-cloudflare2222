import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { accountEmail, loginSchema, maskCpf } from "@/lib/account-validation";

export function AccountLogin({ onAuthenticated }: { onAuthenticated?: (admin: boolean) => void }) {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = loginSchema.safeParse({ cpf, password });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Confira os dados."); return; }
    setBusy(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: accountEmail(parsed.data.cpf), password: parsed.data.password });
      if (loginError) { setError("CPF ou senha incorretos."); return; }
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user) { setError("Não foi possível validar o acesso."); return; }
      const { data: admin, error: roleError } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (roleError) { setError("Não foi possível validar o acesso."); return; }
      if (onAuthenticated) onAuthenticated(Boolean(admin));
      else await navigate({ to: admin ? "/admin" : "/home" });
    } catch { setError("Não foi possível entrar. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <form className="cnh-auth-panel" onSubmit={submit}>
    <h2 className="cnh-auth-title">Acesso ao aplicativo</h2>
    <label htmlFor="login-cpf" className="cnh-auth-label">CPF</label>
    <input id="login-cpf" className="cnh-auth-input" inputMode="numeric" autoComplete="username" maxLength={14} value={cpf} onChange={e => setCpf(maskCpf(e.target.value))} placeholder="Digite seu CPF" disabled={busy}/>
    <label htmlFor="login-password" className="cnh-auth-label">Senha do aplicativo</label>
    <div className="cnh-auth-field"><input id="login-password" className="cnh-auth-input" type={visible ? "text" : "password"} autoComplete="current-password" maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" disabled={busy}/><Button type="button" variant="toolbar" className="cnh-auth-eye" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff/> : <Eye/>}</Button></div>
    {error && <p role="alert" className="cnh-auth-error">{error}</p>}
    <Button variant="cnh" className="cnh-auth-submit" type="submit" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
  </form>;
}