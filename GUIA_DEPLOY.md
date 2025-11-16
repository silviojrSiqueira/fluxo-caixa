# 🚀 Guia de Deploy Gratuito - Fluxo de Caixa

## 📋 Visão Geral

Este guia mostra como colocar seu sistema no ar **100% gratuitamente** usando:
- **Frontend**: Vercel (gratuito)
- **Backend**: Render ou Railway (gratuito)
- **Banco de Dados**: PostgreSQL gratuito

---

## 🎯 Opção 1: Vercel + Render (Recomendado)

### ✅ **Parte 1: Deploy do Frontend (Vercel)**

#### Passo 1: Preparar o Frontend

```bash
cd src

# Instalar dependências
npm install

# Build de produção
npm run build
```

#### Passo 2: Configurar variável de ambiente

Crie `src/.env.production`:
```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

**Importante:** Você vai substituir `seu-backend.onrender.com` pela URL real após deploy do backend.

#### Passo 3: Deploy no Vercel

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Importe seu repositório `fluxo-caixa`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `src`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Adicione Environment Variables:
   - `VITE_API_URL`: (você vai atualizar depois)
7. Clique em "Deploy"

#### Passo 4: Após Deploy

- Anote sua URL: `https://fluxo-caixa-xxx.vercel.app`
- Vai precisar atualizar a URL da API depois

---

### ✅ **Parte 2: Deploy do Backend (Render)**

#### Passo 1: Preparar o Backend para PostgreSQL

**Instalar dependência:**
```bash
cd server
npm install pg
```

**Criar arquivo de configuração do banco:**

Crie `server/database-postgres.js`:

```javascript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
```

**Adaptar index.js** (vamos fazer isso depois se necessário)

#### Passo 2: Deploy no Render

1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique "New +" > "Web Service"
4. Conecte seu repositório
5. Configure:
   - **Name**: `fluxo-caixa-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`

6. Adicione Environment Variables:
   - `PORT`: `3001`
   - `NODE_ENV`: `production`

7. Clique "Create Web Service"

#### Passo 3: Adicionar PostgreSQL

1. No dashboard do Render
2. "New +" > "PostgreSQL"
3. Nome: `fluxo-caixa-db`
4. Instance Type: `Free`
5. Clique "Create Database"
6. Copie a "Internal Database URL"
7. Volte no seu Web Service
8. Environment Variables > Add
   - `DATABASE_URL`: (cole a URL do banco)

#### Passo 4: Anotar URL do Backend

- Sua URL será algo como: `https://fluxo-caixa-api.onrender.com`
- Anote essa URL!

---

### ✅ **Parte 3: Conectar Frontend ao Backend**

#### Volte no Vercel:

1. Acesse seu projeto no Vercel
2. Settings > Environment Variables
3. Edite `VITE_API_URL`:
   - Valor: `https://fluxo-caixa-api.onrender.com/api`
4. Redeploy: Deployments > Mais recente > "Redeploy"

---

## 🎯 Opção 2: Railway (Tudo junto - Mais Fácil)

### Vantagens:
- ✅ Deploy frontend + backend juntos
- ✅ PostgreSQL automático
- ✅ $5 grátis/mês (suficiente)
- ✅ Configuração automática

### Como fazer:

1. **Acesse**: https://railway.app
2. **Login** com GitHub
3. **New Project**
4. **Deploy from GitHub repo**
5. Selecione `fluxo-caixa`
6. Railway vai detectar:
   - Backend Node.js (server/)
   - Frontend Vite (src/)
7. Adicione PostgreSQL:
   - "New" > "Database" > "Add PostgreSQL"
8. Configure variáveis:
   - Railway faz automaticamente!
9. Deploy! 🚀

**URL final:** `https://fluxo-caixa.up.railway.app`

---

## 🎯 Opção 3: Netlify + Fly.io

### Frontend (Netlify):

```bash
cd src
npm run build

# Upload manual
# Ou conecte com GitHub
```

1. https://netlify.com
2. "Add new site" > "Deploy manually"
3. Arraste pasta `src/dist`

### Backend (Fly.io):

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

cd server
fly launch
fly deploy
```

---

## 📊 Comparação de Opções

| Opção | Facilidade | Gratuidade | Recomendado Para |
|-------|-----------|------------|------------------|
| **Vercel + Render** | ⭐⭐⭐⭐ | 100% grátis | Melhor performance |
| **Railway** | ⭐⭐⭐⭐⭐ | $5/mês grátis | Mais fácil |
| **Netlify + Fly.io** | ⭐⭐⭐ | 100% grátis | Mais controle |

---

## ⚠️ Limitações do Plano Gratuito

### Render (Free):
- ⏰ **Auto-sleep** após 15 min de inatividade
- 🐌 **Cold start**: ~30s para despertar
- 💾 PostgreSQL: 256MB (suficiente para uso pessoal)
- ⏱️ 750 horas/mês (suficiente)

### Vercel:
- ✅ Sem limitações práticas
- ✅ 100GB bandwidth/mês
- ✅ Builds ilimitados

### Railway:
- 💰 $5 crédito/mês
- ⏱️ ~500 horas de runtime
- 💾 PostgreSQL: 5GB

---

## 🔧 Configurações Importantes

### CORS no Backend

Se tiver problemas de CORS, atualize `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'https://fluxo-caixa-xxx.vercel.app',
    'http://localhost:4200'
  ],
  credentials: true
}));
```

### Environment Variables

**Frontend (.env.production):**
```env
VITE_API_URL=https://sua-api.onrender.com/api
```

**Backend (Render/Railway):**
```env
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
```

---

## 📝 Checklist de Deploy

### Antes do Deploy:
- [ ] Código no GitHub
- [ ] Build funcionando localmente
- [ ] Testes básicos OK

### Durante o Deploy:
- [ ] Frontend deployado
- [ ] Backend deployado
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado

### Após o Deploy:
- [ ] Frontend carrega
- [ ] Consegue fazer login/usar
- [ ] API responde
- [ ] Dados salvam no banco
- [ ] Testar em diferentes dispositivos

---

## 🐛 Solução de Problemas

### Frontend não conecta com Backend

**Causa:** URL da API incorreta

**Solução:**
```javascript
// Verifique em openFinanceService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### Backend com erro 503

**Causa:** Cold start no Render (15min inativo)

**Solução:** 
- Espere 30s
- Ou use [Cron-job.org](https://cron-job.org) para fazer ping a cada 14 min

### CORS Error

**Solução:**
```javascript
// server/index.js
app.use(cors({
  origin: 'https://seu-frontend.vercel.app'
}));
```

### Banco de dados não conecta

**Solução:**
- Verifique `DATABASE_URL` nas variáveis de ambiente
- Certifique-se que tem `ssl: { rejectUnauthorized: false }`

---

## 💰 Custos (Todos Gratuitos!)

| Serviço | Custo | Limitações |
|---------|-------|------------|
| Vercel | **$0** | 100GB bandwidth |
| Render Free | **$0** | Auto-sleep, 750h/mês |
| Railway | **$0** | $5 crédito/mês |
| PostgreSQL | **$0** | 256MB-1GB |

---

## 🚀 Deploy Rápido (Railway)

Se quiser o mais rápido:

```bash
# 1. Faça push no GitHub
git add .
git commit -m "Deploy"
git push

# 2. Acesse Railway
https://railway.app

# 3. Importe do GitHub

# 4. Pronto! ✅
```

Railway detecta tudo automaticamente e faz deploy completo!

---

## 📱 Acesso ao Sistema

Após deploy, você terá:

- **Frontend**: `https://fluxo-caixa.vercel.app`
- **Backend**: `https://fluxo-caixa-api.onrender.com`
- **Mobile**: `https://fluxo-caixa.vercel.app/mobile-preview`

---

## 🎉 Próximos Passos

Depois do deploy:

1. **Custom Domain** (opcional)
   - Vercel permite domínio customizado grátis
   - Ex: `fluxocaixa.seusite.com`

2. **Monitoramento**
   - Render tem logs integrados
   - Configure alertas de uptime

3. **Backups Automáticos**
   - PostgreSQL tem backups diários
   - Exporte dados periodicamente

4. **Analytics** (opcional)
   - Google Analytics
   - Vercel Analytics

---

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app

---

**Boa sorte com o deploy! 🚀**

Se tiver dúvidas durante o processo, é só perguntar!

