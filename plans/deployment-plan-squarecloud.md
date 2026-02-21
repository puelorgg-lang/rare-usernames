# Plano de Deploy: Projeto Rare Usernames no Squarecloud

## Arquitetura

```mermaid
graph TB
    subgraph "Squarecloud"
        A[Next.js 14 App Router]
        B[Banco PostgreSQL]
        C[monitor.js Bot]
    end
    
    subgraph "Serviços Externos"
        D[API Discord]
        E[Stripe]
        F[MercadoPago]
    end
    
    A --> B
    C --> A
    C --> D
    A --> E
    A --> F
```

---

## Passo 1: Preparar o Projeto

### 1.1 Atualizar o Schema do Prisma para PostgreSQL

Modifique o arquivo `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                      String             @id @default(uuid())
  discordId              String             @unique @map("discord_id")
  email                  String             @unique
  image                  String?
  role                   String             @default("USER")
  subscriptionStatus     String             @default("INACTIVE")
  subscriptionPlan       String?
  subscriptionExpiresAt  DateTime?          @map("subscription_expires_at")
  createdAt              DateTime           @default(now()) @map("created_at")
  updatedAt              DateTime           @updatedAt @map("updated_at")

  @@map("users")
}

model Username {
  id            String    @id @default(uuid())
  name          String
  platform      String
  category      String
  status        String    @default("AVAILABLE")
  availableDate DateTime? @map("available_date")
  foundAt       DateTime  @default(now()) @map("found_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@unique([name, platform])
  @@map("usernames")
}
```

### 1.2 Atualizar o monitor.js

Modifique a linha 8 do arquivo `monitor.js`:

```javascript
// De:
const SITE_URL = 'http://localhost:3000';

// Para:
const SITE_URL = 'https://seu-subdomain.squarecloud.app';
```

### 1.3 Criar arquivo squarecloud.json

Crie o arquivo `squarecloud.json` na raiz do projeto:

```json
{
  "name": "rare-usernames",
  "version": "1.0.0",
  "description": "Rare Usernames Monitor",
  "main": "monitor.js",
  "scripts": {
    "start": "node monitor.js",
    "build": "next build",
    "install": "npm install && npx prisma generate"
  },
  "engines": {
    "node": "18"
  }
}
```

---

## Passo 2: Configurar o Banco de Dados no Squarecloud

### 2.1 Criar Banco de Dados
1. Acesse o [Squarecloud](https://squarecloud.app)
2. Faça login com sua conta
3. Vá em "Bancos de Dados" → "Criar Banco"
4. Selecione **PostgreSQL**
5. Anote as credenciais:
   - Host
   - Porta
   - Usuário
   - Senha
   - Nome do banco

### 2.2 Configurar VARIÁVEL DE AMBIENTE do Banco

A URL de conexão terá o formato:
```
postgresql://usuario:senha@host:porta/nome_banco
```

---

## Passo 3: Fazer Upload do Projeto

### 3.1 Via GitHub (Recomendado)
1. Faça push do seu código para o GitHub
2. No Squarecloud, selecione "Importar do GitHub"
3. Selecione seu repositório

### 3.2 Via Upload ZIP
1. Compacte os arquivos do projeto (exceto node_modules)
2. No Squarecloud, selecione "Upload de Arquivos"

---

## Passo 4: Configurar Variáveis de Ambiente

No painel do Squarecloud, configure as seguintes variáveis:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://user:password@host:5432/dbname` |
| `NEXTAUTH_URL` | `https://seu-subdomain.squarecloud.app` |
| `NEXTAUTH_SECRET` | Gere com: `openssl rand -base64 32` |
| `DISCORD_CLIENT_ID` | ID do seu app no Discord |
| `DISCORD_CLIENT_SECRET` | Segredo do seu app no Discord |
| `DISCORD_TOKEN` | Token do seu bot Discord |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook Stripe |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Chave pública MercadoPago |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso MercadoPago |

---

## Passo 5: Configurar o Discord Developer Portal

### 5.1 Atualizar Redirects do OAuth
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecione sua aplicação
3. Vá em OAuth2 → Redirects
4. Adicione: `https://seu-subdomain.squarecloud.app/api/auth/callback/discord`

### 5.2 Configurar o Bot
1. Vá na seção Bot
2. Copie o token
3. Ative "Message Content Intent"

---

## Passo 6: Configurar Webhooks do Stripe

### 6.1 URL de Webhook
No Stripe Dashboard → Developers → Webhooks:
- Endpoint: `https://seu-subdomain.squarecloud.app/api/webhooks/stripe`
- Eventos: `checkout.session.completed`, `customer.subscription.*`

---

## Passo 7: Executar as Migrações do Prisma

No terminal do Squarecloud ou本地mente primeiro, execute:

```bash
# Gerar o Prisma Client
npx prisma generate

# Enviar schema para o banco
npx prisma db push
```

---

## Passo 8: Iniciar os Serviços

### 8.1 Iniciar o Next.js
No Squarecloud, configure:
- Tipo: aplicação Node.js
- Comando de start: `npm run start`
- Porta: 3000

### 8.2 Iniciar o monitor.js
Você pode rodar o monitor.js de duas formas:

**Opção A: Mesmo app do Next.js**
- O Next.js não roda bem junto com o monitor.js no mesmo processo

**Opção B: App separado (Recomendado)**
1. Crie um segundo app no Squarecloud apenas para o bot
2. Configure:
   - Tipo: aplicação Node.js
   - Comando de start: `node monitor.js`
   - Variável `SITE_URL`: URL do seu app principal

---

## Checklist Final

- [ ] Banco PostgreSQL criado no Squarecloud
- [ ] Schema do Prisma atualizado para PostgreSQL
- [ ] Variáveis de ambiente configuradas
- [ ] Redirect URI do Discord atualizado
- [ ] Webhooks do Stripe configurados
- [ ] Arquivo squarecloud.json criado
- [ ] Código enviado para o Squarecloud
- [ ] Migrações do Prisma executadas
- [ ] Deploy do Next.js iniciado
- [ ] Deploy do monitor.js iniciado

---

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**: Verifique se a URL está correta com `?schema=public`
2. **Erro no OAuth do Discord**: Verifique se o redirect URI está exatamente igual
3. **Monitor.js não envia dados**: Verifique se a variável SITE_URL está HTTPS

### Comandos Úteis

```bash
# Testar conexão com banco localmente
npx prisma studio

# Verificar versão do Prisma
npx prisma --version
```

---

## Custos Estimados (Squarecloud)

| Serviço | Plano Grátis | Plano Pago |
|---------|--------------|------------|
| Next.js | ✅ Limitado | A partir de R$ 20/mês |
| PostgreSQL | ✅ Limitado | A partir de R$ 15/mês |
| monitor.js | ✅ Limitado | Mesmo plano |

*Valores sujetos a alteração. Consulte o site oficial do Squarecloud.*

---

*Plano criado em: 2026-02-21*
