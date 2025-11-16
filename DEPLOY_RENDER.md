# 🚀 Deploy no Render - Guia Completo

Este guia mostra como fazer deploy do sistema Fluxo de Caixa no Render (100% gratuito).

## ✅ Backend já está no ar!

Se você chegou até aqui, parabéns! O backend está funcionando.

---

## 📱 Deploy do Frontend

### **Passo 1: Configurar a URL do Backend**

Antes de fazer o deploy, você precisa saber a URL do seu backend.

No dashboard do Render, vá até o Web Service do backend e copie a URL (algo como):
```
https://fluxo-caixa-api.onrender.com
```

### **Passo 2: Criar Static Site no Render**

1. **Acesse:** https://dashboard.render.com
2. **Clique em:** "New +" → "Static Site"
3. **Conecte o repositório:** `silviojrSiqueira/fluxo-caixa`
4. **Configure:**

| Campo | Valor |
|-------|-------|
| **Name** | `fluxo-caixa` (ou o nome que preferir) |
| **Branch** | `main` |
| **Root Directory** | `src` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

5. **Environment Variables:**

Clique em "Advanced" → "Add Environment Variable":

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://SEU-BACKEND.onrender.com/api` |

⚠️ **IMPORTANTE:** Substitua `SEU-BACKEND` pela URL real do seu backend!

Exemplo: `https://fluxo-caixa-api.onrender.com/api`

6. **Clique em:** "Create Static Site"

### **Passo 3: Aguardar o Build**

O Render vai:
- ✅ Clonar o repositório
- ✅ Instalar dependências (`npm install`)
- ✅ Fazer build do React (`npm run build`)
- ✅ Publicar os arquivos estáticos

⏱️ **Tempo estimado:** 3-5 minutos

---

## 🎉 Pronto!

Após o deploy concluir, você terá:

- **Backend:** `https://seu-backend.onrender.com`
- **Frontend:** `https://seu-frontend.onrender.com`

---

## 🔧 Configurar CORS no Backend

Se você tiver problemas de CORS (erro de "Access-Control-Allow-Origin"), precisamos adicionar a URL do frontend no backend.

**Passo extra (se necessário):**

1. Copie a URL do frontend (ex: `https://fluxo-caixa.onrender.com`)
2. Vá no Web Service do **backend**
3. Adicione variável de ambiente:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://seu-frontend.onrender.com`

---

## 📊 Testando

Após o deploy:

1. Acesse a URL do frontend
2. Tente adicionar uma entrada manual
3. Verifique se está salvando no banco (PostgreSQL)
4. Teste a integração com Open Finance

---

## 🐛 Troubleshooting

### Problema: "Failed to fetch" ou erro de rede

**Solução:**
- Verifique se a variável `VITE_API_URL` está configurada corretamente
- Certifique-se de que termina com `/api`
- Exemplo correto: `https://fluxo-caixa-api.onrender.com/api`

### Problema: CORS Error

**Solução:**
Adicione isso no `server/index.js` (se não tiver):

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

### Problema: Backend hiberna (cold start)

**Solução:**
- É normal no plano gratuito do Render
- Após 15 minutos de inatividade, o serviço hiberna
- Primeiro acesso pode demorar ~30 segundos

---

## 💡 Dicas

1. **Auto-Deploy:** O Render faz deploy automático a cada push no GitHub
2. **Logs:** Acesse os logs em tempo real no dashboard do Render
3. **Custom Domain:** Você pode adicionar um domínio customizado (gratuito)
4. **SSL:** HTTPS é automático e gratuito

---

## 🎯 URLs Finais

Após completar todos os passos, anote suas URLs:

- **Frontend:** ___________________________________
- **Backend:** ___________________________________
- **Database:** Gerenciado pelo Render (internal)

---

**Feito com ❤️ para simplificar seu fluxo de caixa!**

