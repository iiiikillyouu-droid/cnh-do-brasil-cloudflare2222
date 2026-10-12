# CNH do Brasil — repositório para Cloudflare

App completo (telas + servidor) preparado para ser publicado **direto no Cloudflare Workers**.
Ele usa o mesmo banco Supabase de sempre (`rdjouxtnfczndlqopbnc`), então os usuários já
cadastrados e as fotos de CNH enviadas aparecem normalmente — não é preciso migrar nada.

O build gera:

- `dist/server/` — o servidor (Workers)
- `dist/client/` — as páginas, imagens e ícones

E o `wrangler.jsonc` na raiz já aponta para esses dois lugares.

---

## 1. Uma vez só: instalar dependências

Precisa de [Bun](https://bun.sh) (ou Node 20+ com `npm`).

```bash
bun install
```

## 2. Rodar no seu computador

```bash
bun run dev
```

Abra o endereço que aparecer (normalmente `http://localhost:8080`).
O arquivo `.env` já traz o endereço público do banco, então funciona sem configurar nada.

Para testar exatamente como vai ficar no Cloudflare (primeiro rode `bun run build`):

```bash
cp .dev.vars.example .dev.vars   # e cole a chave service_role dentro dele
bun run build
npx wrangler dev
```

## 3. Publicar no Cloudflare

```bash
npx wrangler login                              # abre o navegador para entrar na sua conta
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY   # cole a chave e dê Enter
bun run build
npx wrangler deploy
```

A chave `service_role` fica no painel do Supabase, em **Settings → API → service_role key**.
Ela é secreta: fica guardada no Cloudflare, nunca no código.

No final o `wrangler` mostra o endereço do app, algo como
`https://cnh-do-brasil.<sua-conta>.workers.dev`.

## 4. Depois de publicar: liberar o endereço no Supabase

Abra o painel do Supabase → **Authentication → URL Configuration** e inclua o endereço
novo do app em **Site URL** e **Redirect URLs**. Sem isso, o acesso pode falhar no
endereço publicado mesmo funcionando aqui.

---

## Publicar a cada mudança

```bash
bun run build
npx wrangler deploy
```

## Deixar publicado automaticamente (Cloudflare Builds)

Conecte o repositório no painel do Cloudflare (Workers → Create → Build) e use:

- **Build command:** `bun run build`
- **Deploy command:** `npx wrangler deploy`

Lá mesmo, em **Settings → Variables**, adicione `SUPABASE_SERVICE_ROLE_KEY` como **secret**
(como "Encrypted"). As outras variáveis já estão no `wrangler.jsonc` porque são públicas.

---

## O que cada arquivo faz

| Arquivo | Para que serve |
| --- | --- |
| `wrangler.jsonc` | Configuração do envio ao Cloudflare (nome, arquivos, variáveis) |
| `.dev.vars.example` | Modelo das chaves locais — copie para `.dev.vars` |
| `.env` | Endereço público do banco (usado na hora de gerar o build) |
| `supabase/migrations/` | Instruções que criaram as tabelas do banco |
| `src/` | Todo o app |

## Se quiser trocar de banco

Edite `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PROJECT_ID` no `wrangler.jsonc`
e `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env`, rode `bun run build`
de novo e publique. As tabelas são criadas com o SQL de `supabase/migrations/`.

## Testes

```bash
bun run test
```
