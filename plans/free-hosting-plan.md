# Guia de Hospedagem Gratuíta

## Opções Gratuitas por Componente

| Componente | Serviço Gratuito | Limites |
|------------|------------------|---------|
| **Next.js** | Vercel | Ilimitado (função) |
| **monitor.js** | Render / Fly.io | 750h/mês (idle) |
| **PostgreSQL** | Neon / Supabase | 512MB / 1 projeto |
| **DOMÍNIO** | .vercel.app ou .onrender.com | Gratuito |

---

## Arquitetura Completa e Gratuíta

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Next.js)                     │
│              https://seu-projeto.vercel.app             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    NEON (PostgreSQL)                    │
│                 postgresql://...neon.tech              │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────┐
│                    RENDER (Bot)                          │
│             https://monitor-seuapp.onrender.com        │
└─────────────────────────────────────────────────────────┘
```

---

## Passo 1: Configurar PostgreSQL no Neon (Gratuito)

1. Acesse [neon.tech](https://neon.tech)
2. Faça login com GitHub
3. Clique em "Create Project"
4. Nome: `rare-usernames`
5. Copie a **Connection String** (formato: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require`)

---

## Passo 2: Deploy do Next.js no Vercel (Gratuito)

### Opção A: Via GitHub (Recomendado)
1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Add New..." → "Project"
4. Selecione seu repositório
5. Configure:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Em "Environment Variables", adicione:
   ```
   DATABASE_URL=postgresql://... (do Neon)
   NEXTAUTH_URL=https://seu-app.vercel.app
   NEXTAUTH_SECRET= (gere com: openssl rand -base64 32)
   DISCORD_CLIENT_ID=...
   DISCORD_CLIENT_SECRET=...
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   ```
7. Clique em **Deploy**

### Opção B: Via CLI
```bash
npm i -g vercel
vercel login
vercel
```

---

## Passo 3: Deploy do monitor.js no Render (Gratuito)

1. Acesse [render.com](https://render.com)
2. Faça login com GitHub
3. Clique em "New" → "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - Name: `monitor-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node monitor.js`
6. Em "Environment Variables", adicione:
   ```
   DISCORD_TOKEN=seu-token-discord
   DATABASE_URL=postgresql://... (do Neon)
   SITE_URL=https://seu-app.vercel.app
   NODE_ENV=production
   ```
7. Clique em "Create Web Service"

**Nota:** O plano gratuito do Render entra em modo "sleep" após 15 minutos de inatividade. Para manter ativo, você pode usar um serviço de uptime ou fazer deploy no Fly.io (que não dorme).

---

## Passo 4: Atualizar o monitor.js

No arquivo `monitor.js`, linha 8, altere:

```javascript
// De:
const SITE_URL = 'http://localhost:3000';

// Para (use seu domínio Vercel):
const SITE_URL = 'https://seu-projeto.vercel.app';
```

---

## Passo 5: Configurar Discord OAuth

1. Acesse [discord.com/developers/applications](https://discord.com/developers/applications)
2. Selecione seu app → OAuth2 → Redirects
3. Adicione: `https://seu-projeto.vercel.app/api/auth/callback/discord`

---

## Variáveis de Ambiente Completas

### Vercel (Next.js)
```
DATABASE_URL=postgresql://user:pass@host/neon?sslmode=require
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta
DISCORD_CLIENT_ID=seu-client-id
DISCORD_CLIENT_SECRET=seu-client-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
```

### Render (monitor.js)
```
DISCORD_TOKEN=seu-bot-token
DATABASE_URL=postgresql://user:pass@host/neon?sslmode=require
SITE_URL=https://seu-projeto.vercel.app
NODE_ENV=production
```

---

## Alternativa: Fly.io (Sem Sleep)

Se você quer que o monitor.js fique **sempre ativo** (sem dormir), use **Fly.io**:

1. Acesse [fly.io](https://fly.io)
2. Instale o CLI: `npm i -g flyctl`
3. Faça login: `flyctl auth login`
4. Crie o app: `flyctl create monitor-bot`
5. Configure o `Dockerfile` ou use o `fly.toml`

 fly.toml exemplo:
```toml
app = "monitor-bot"

[build]
  builder = "paketobuildpacks/builder:nodejs"

[env]
  NODE_ENV = "production"

[[services]]
  protocol = "tcp"
  internal_port = 3000
  [[services.ports]]
    port = "3000"
```

---

## Resumo de Custos

| Serviço | Plano | Preço |
|---------|-------|-------|
| Vercel | Hobby | **Grátis** |
| Neon | Free | **Grátis** |
| Render | Free | **Grátis** |
| Discord API | - | **Grátis** |
| Stripe | Test Mode | **Grátis** |

**Total: R$ 0,00 / mês**

---

## Troubleshooting

### Problema: "Prisma connection error"
**Solução:** Adicione `?sslmode=require` no final da URL do banco:
```
DATABASE_URL="postgresql://...neon.tech/db?sslmode=require"
```

### Problema: "OAuth redirect mismatch"
**Solução:** Verifique se a URL de callback no Discord Developer Portal está **exatamente** igual à URL do Vercel.

### Problema: Bot não envia dados
**Solução:** Verifique se a variável `SITE_URL` no Render está com `https://` (não `http://`).

---

##os Passos

 Próxim1. ✅ Criar conta no Neon
2. ✅ Criar conta no Vercel  
3. ✅ Criar conta no Render
4. ⏳ Fazer push para GitHub
5. ⏳ Configurar variáveis de ambiente
6. ⏳ Deploy

Quer que eu ajude a configurar algum desses serviços específicos?
