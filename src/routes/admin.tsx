import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/cnh/TopBar";
import { Button } from "@/components/ui/button";
import { cnhHead } from "@/lib/cnh-meta";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AccountLogin } from "@/components/cnh/AccountLogin";
import { createAccount, deleteAccount, editAccount, listAccounts } from "@/lib/accounts.functions";
import { createAccountSchema, editAccountSchema, maskCpf } from "@/lib/account-validation";
import { CnhDocumentEditor, emptyDocuments, type DocumentDraft } from "@/components/cnh/CnhDocumentEditor";
import { loadCnhDocuments, saveCnhDocuments } from "@/lib/cnh-documents.functions";
import { DOCUMENT_BUCKET, validateImage } from "@/lib/cnh-document-validation";

export const Route = createFileRoute("/admin")({head: () => ({meta: [...cnhHead("Painel", "Área administrativa restrita.").meta, {name: "robots", content: "noindex, nofollow"}]}), component: Admin});
function Admin() {
  const [access, setAccess] = useState<"loading" | "signed-out" | "denied" | "admin">("loading");
  useEffect(() => {
    let active = true;
    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) { setAccess("signed-out"); return; }
      const { data: allowed } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (active) setAccess(allowed ? "admin" : "denied");
    })();
    return () => { active = false; };
  }, []);
  return <div className="cnh-page"><TopBar title="PAINEL DO ADMINISTRADOR" backTo="/"/>
    {access === "loading" && <p className="cnh-auth-panel" role="status">Validando acesso…</p>}
    {access === "signed-out" && <AccountLogin onAuthenticated={admin => setAccess(admin ? "admin" : "denied")}/>}
    {access === "denied" && <main className="cnh-auth-panel"><p className="cnh-auth-error" role="alert">Acesso restrito a administradores.</p><Button variant="cnh" onClick={() => void supabase.auth.signOut().then(() => setAccess("signed-out"))}>Sair</Button></main>}
    {access === "admin" && <AccountEditor onLogout={() => setAccess("signed-out")}/>}
  </div>;
}

type Account = { id: string; cpf: string | null; full_name: string; created_at: string; category: string | null; uf: string | null; validade: string | null; emissao: string | null; sexo: string | null };
function AccountEditor({ onLogout }: { onLogout: () => void }) {
  const list = useServerFn(listAccounts);
  const create = useServerFn(createAccount);
  const edit = useServerFn(editAccount);
  const remove = useServerFn(deleteAccount);
  const loadDocuments = useServerFn(loadCnhDocuments);
  const saveDocuments = useServerFn(saveCnhDocuments);
  const [documents, setDocuments] = useState<DocumentDraft[]>(emptyDocuments);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsFailed, setDocumentsFailed] = useState(false);
  const [users, setUsers] = useState<Account[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");
  const [uf, setUf] = useState("");
  const [validade, setValidade] = useState("");
  const [emissao, setEmissao] = useState("");
  const [sexo, setSexo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void list().then(rows => { if (active) setUsers(rows); }).catch(() => { if (active) setError("Não foi possível carregar os cadastros."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [list]);
  useEffect(() => {
    let active = true;
    setDocuments(emptyDocuments()); setDocumentsFailed(false);
    if (!id) { setDocumentsLoading(false); return; }
    setDocumentsLoading(true);
    void loadDocuments({ data: { userId: id } }).then(rows => {
      if (active) setDocuments(emptyDocuments().map(document => {
        const row = rows.find(row => row.side === document.side);
        return row ? { ...document, note: row.note, photoName: row.photoName, storagePath: row.storagePath, url: row.url } : document;
      }));
    }).catch(() => { if (active) { setDocumentsFailed(true); setError("Não foi possível carregar os documentos. Reabra o cadastro para tentar novamente."); } }).finally(() => { if (active) setDocumentsLoading(false); });
    return () => { active = false; };
  }, [id, loadDocuments]);
  async function removeUser(user: Account) {
    if (!window.confirm(`Apagar o cadastro de ${user.full_name || "este usuário"}? Isso remove as fotos e o acesso.`)) return;
    setBusy(true); setError(""); setNotice("");
    try { await remove({ data: { id: user.id } }); if (id === user.id) reset(); setUsers(await list()); setNotice("Cadastro apagado."); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Não foi possível apagar."); }
    finally { setBusy(false); }
  }
  function reset() { setId(null); setName(""); setCpf(""); setPassword(""); setCategory(""); setUf(""); setValidade(""); setEmissao(""); setSexo(""); setDocuments(emptyDocuments()); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    const input = id ? editAccountSchema.safeParse({ id, fullName: name, password, category, uf, validade, emissao, sexo }) : createAccountSchema.safeParse({ cpf, fullName: name, password, category, uf, validade, emissao, sexo });
    if (!input.success) { setError(input.error.issues[0]?.message ?? "Confira os dados."); return; }
    setBusy(true);
    let accountId = id;
    let documentsSaved = false;
    const uploaded: string[] = [];
    try {
      let sexoSaved = true;
      if (id) sexoSaved = (await edit({ data: editAccountSchema.parse({ id, fullName: name, password, category, uf, validade, emissao, sexo }) })).sexoSaved;
      else {
        const created = await create({ data: createAccountSchema.parse({ cpf, fullName: name, password, category, uf, validade, emissao, sexo }) });
        accountId = created.id;
        sexoSaved = created.sexoSaved;
      }
      if (!sexoSaved) setError("O campo sexo não foi salvo porque a coluna sexo ainda não existe na tabela profiles. Peça ao responsável pelo banco para criá-la.");
      if (!accountId) throw new Error("Cadastro não encontrado.");
      const saved = [];
      for (const document of documents) {
        let storagePath = document.storagePath;
        if (document.file) {
          validateImage(document.file);
          const extension = document.file.type === 'image/jpeg' ? 'jpg' : document.file.type === 'image/png' ? 'png' : 'webp';
          storagePath = `${accountId}/${document.side}/${crypto.randomUUID()}.${extension}`;
          const { error: uploadError } = await supabase.storage.from(DOCUMENT_BUCKET).upload(storagePath, document.file, { contentType: document.file.type, upsert: false });
          if (uploadError) throw new Error("Não foi possível enviar a foto. Tente novamente.");
          uploaded.push(storagePath);
        }
        saved.push({ side: document.side, photoName: document.photoName, note: document.note, storagePath });
      }
      const result = await saveDocuments({ data: { userId: accountId, documents: saved } });
      documentsSaved = true;
      if (typeof window !== "undefined" && accountId) { localStorage.setItem("cnh_active_user_id", accountId); }
      setNotice(id ? "Cadastro atualizado." : "Cadastro criado."); reset();
      if (result.cleanupPending) setNotice("Cadastro salvo. A remoção do arquivo antigo não foi concluída; tente novamente mais tarde.");
      setUsers(await list());
    } catch (problem) {
      if (!documentsSaved && uploaded.length) await supabase.storage.from(DOCUMENT_BUCKET).remove(uploaded);
      if (!id && accountId && !documentsSaved) {
        setUsers(await list());
        reset();
        setError("A conta foi criada, mas os documentos não foram salvos. Abra Editar para enviá-los novamente.");
      } else setError(problem instanceof Error ? problem.message : "Não foi possível salvar.");
    }
    finally { setBusy(false); }
  }
  return <>
    <form className="cnh-auth-panel" onSubmit={save}><h2 className="cnh-auth-title">{id ? "Editar cadastro" : "Liberar novo acesso"}</h2>
      <label className="cnh-auth-label" htmlFor="novo-nome">Nome completo</label><input id="novo-nome" className="cnh-auth-input" placeholder="Nome completo" maxLength={150} value={name} onChange={e => setName(e.target.value)} disabled={busy}/>
      <label className="cnh-auth-label" htmlFor="novo-cpf">CPF</label><input id="novo-cpf" className="cnh-auth-input" placeholder="Digite o CPF" inputMode="numeric" maxLength={14} value={cpf} onChange={e => setCpf(maskCpf(e.target.value))} disabled={busy || Boolean(id)}/>
      {!id && <><label className="cnh-auth-label" htmlFor="nova-senha">{id ? "Nova senha (opcional)" : "Senha do aplicativo"}</label><input id="nova-senha" className="cnh-auth-input" type="password" autoComplete="new-password" maxLength={128} placeholder={id ? "Deixe vazio para manter a senha" : "Defina a senha"} value={password} onChange={e => setPassword(e.target.value)} disabled={busy}/></>}
      <div className="cnh-admin-fields"><div><label className="cnh-auth-label" htmlFor="edit-category">Categoria</label><input id="edit-category" className="cnh-auth-input" placeholder="Categoria" maxLength={20} value={category} onChange={e => setCategory(e.target.value)} disabled={busy}/></div><div><label className="cnh-auth-label" htmlFor="edit-uf">UF</label><input id="edit-uf" className="cnh-auth-input" placeholder="UF" maxLength={2} value={uf} onChange={e => setUf(e.target.value.toUpperCase())} disabled={busy}/></div><div><label className="cnh-auth-label" htmlFor="edit-validade">Validade</label><input id="edit-validade" className="cnh-auth-input" placeholder="Validade" maxLength={20} value={validade} onChange={e => setValidade(e.target.value)} disabled={busy}/></div><div><label className="cnh-auth-label" htmlFor="edit-emissao">Emissão</label><input id="edit-emissao" className="cnh-auth-input" placeholder="Emissão" maxLength={20} value={emissao} onChange={e => setEmissao(e.target.value)} disabled={busy}/></div><div><label className="cnh-auth-label" htmlFor="edit-sexo">Sexo</label><select id="edit-sexo" className="cnh-auth-input" value={sexo} onChange={e => setSexo(e.target.value)} disabled={busy}><option value="">Não informado</option><option value="M">Masculino</option><option value="F">Feminino</option></select></div></div>
      {documentsLoading && <p role="status" className="cnh-auth-hint">Carregando documentos…</p>}
      <CnhDocumentEditor documents={documents} onChange={setDocuments} disabled={busy || documentsLoading || documentsFailed} onError={setError}/>
      {error && <p className="cnh-auth-error" role="alert">{error}</p>}{notice && <p className="cnh-admin-notice" role="status">{notice}</p>}
      <Button type="submit" variant="cnh" className="cnh-auth-submit" disabled={busy || documentsLoading || documentsFailed}>{busy ? "Salvando…" : id ? "Salvar alterações" : "Cadastrar"}</Button>
      {id && <Button type="button" variant="outline" className="cnh-auth-cancel" onClick={reset} disabled={busy}>Cancelar</Button>}
    </form>
    <nav className="cnh-auth-panel" aria-label="Telas do usuário"><h2 className="cnh-auth-title">Telas do usuário</h2><div className="cnh-admin-links">{([["/home","Início"],["/condutor","Condutor"],["/habilitacao","Habilitação"],["/servicos","Serviços"],["/historico","Histórico"],["/mensagens","Mensagens"]] as const).map(([to, label]) => <Button asChild variant="outline" key={to}><Link to={to}>{label}</Link></Button>)}</div></nav>
    <section className="cnh-auth-panel"><h2 className="cnh-auth-title">Usuários cadastrados ({users.length})</h2>
      {loading ? <p role="status">Carregando…</p> : users.length === 0 ? <p className="cnh-auth-hint">Nenhum usuário cadastrado.</p> : <ul className="cnh-admin-list">{users.map(user => <li className="cnh-admin-row" key={user.id}><div><p className="cnh-auth-value">{user.full_name || "Sem nome"}</p><p className="cnh-auth-hint">{user.cpf ? maskCpf(user.cpf) : "CPF não definido"}</p></div><div className="cnh-admin-actions"><Button variant="outline" disabled={busy} onClick={() => { setId(user.id); setName(user.full_name); if (typeof window !== "undefined") { localStorage.setItem("cnh_active_user_id", user.id); } setCpf(maskCpf(user.cpf ?? "")); setPassword(""); setCategory(user.category ?? ""); setUf(user.uf ?? ""); setValidade(user.validade ?? ""); setEmissao(user.emissao ?? ""); setSexo(user.sexo ?? ""); setError(""); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar</Button><Button variant="outline" className="cnh-admin-delete" disabled={busy} onClick={() => void removeUser(user)}>Apagar</Button></div></li>)}</ul>}
      <Button variant="outline" className="cnh-auth-cancel" onClick={async () => { await supabase.auth.signOut(); onLogout(); }}>Sair do painel</Button>
    </section>
  </>;
}