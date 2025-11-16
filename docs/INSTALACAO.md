# Guia de Instalação - Fluxo de Caixa

## Requisitos

### Software Necessário

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (incluído com Node.js)
- **Git** ([Download](https://git-scm.com/))

### Verificação de Instalação

```bash
node --version  # deve retornar v18.x.x ou superior
npm --version   # deve retornar 9.x.x ou superior
```

## Instalação Completa

### 1. Clone o Repositório (se aplicável)

```bash
git clone <url-do-repositorio>
cd fluxo-caixa
```

### 2. Instale Todas as Dependências

#### Opção A: Instalação Automática (Recomendado)

```bash
npm run install:all
```

Este comando irá:
1. Instalar dependências do root (concurrently)
2. Instalar dependências do frontend (src/)
3. Instalar dependências do backend (server/)

#### Opção B: Instalação Manual

```bash
# Root
npm install

# Frontend
cd src
npm install
cd ..

# Backend
cd server
npm install
cd ..
```

### 3. Estrutura de Diretórios

Após a instalação, você terá:

```
fluxo-caixa/
├── database/
│   └── open_finance_schema.sql
├── docs/
│   ├── RESUMO_SOLICITACOES.md
│   ├── LICOES_APRENDIDAS.md
│   ├── AGENTES_IA.md
│   └── INSTALACAO.md
├── server/
│   ├── database.js
│   ├── index.js
│   ├── package.json
│   └── node_modules/
├── src/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── node_modules/
├── package.json
├── README.md
└── .gitignore
```

## Executando o Projeto

### Modo Desenvolvimento (Recomendado)

**Comando único que inicia frontend + backend:**

```bash
npm run dev
```

Isso irá:
- ✅ Iniciar o backend na porta **3001**
- ✅ Iniciar o frontend na porta **5173**
- ✅ Hot reload automático em ambos

Acesse:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Mobile Preview: http://localhost:5173/mobile-preview

### Modo Separado (Desenvolvimento Avançado)

**Terminal 1 - Backend:**

```bash
npm run dev:backend
# ou
cd server && npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run dev:frontend
# ou
cd src && npm run dev
```

### Build de Produção

```bash
npm run build
```

Isso gera os arquivos otimizados em `src/dist/`

## Configuração do Banco de Dados

### Inicialização Automática

O banco de dados SQLite é criado automaticamente na primeira execução do backend em:

```
database/open_finance.db
```

### Seeds (Dados de Exemplo)

O sistema insere automaticamente dados de exemplo se o banco estiver vazio:

- ✅ 1 usuário demo
- ✅ 9 instituições financeiras
- ✅ 3 contas bancárias
- ✅ 3 cartões de crédito
- ✅ 4 investimentos
- ✅ 2 operações de crédito
- ✅ 7 cotações

### Resetar Banco de Dados

Para resetar o banco e recriar com seeds:

```bash
# Remover banco existente
rm database/open_finance.db

# Reiniciar o backend
npm run dev:backend
```

## Verificação da Instalação

### 1. Teste o Backend

```bash
curl http://localhost:3001/api/health
```

**Resposta esperada:**

```json
{
  "status": "ok",
  "message": "API Fluxo de Caixa funcionando",
  "timestamp": "2024-11-13T..."
}
```

### 2. Teste o Frontend

Abra http://localhost:5173 no navegador

Você deve ver:
- ✅ Header com título "Fluxo de Caixa"
- ✅ Cards de resumo (Receitas, Despesas, Saldo)
- ✅ Abas de navegação
- ✅ Formulário de nova entrada

### 3. Teste Open Finance

1. Clique na aba "🏦 Open Finance"
2. Clique em "🔄 Atualizar Dados"
3. Deve carregar dados das contas, cartões, etc.

### 4. Teste Agentes IA

Clique em qualquer botão de agente no header:
- 💬 Chat IA
- 🏦 Agente Financeiro
- 📊 Agente Investimentos

## Solução de Problemas

### Erro: "EADDRINUSE" (Porta em uso)

**Problema:** Porta 3001 ou 5173 já está em uso

**Solução:**

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

Ou altere as portas em:
- Backend: `server/index.js` (linha com `PORT`)
- Frontend: `src/vite.config.ts` (seção `server`)

### Erro: "Cannot find module"

**Problema:** Dependências não instaladas corretamente

**Solução:**

```bash
# Limpar cache e reinstalar
rm -rf node_modules src/node_modules server/node_modules
rm -rf package-lock.json src/package-lock.json server/package-lock.json
npm run install:all
```

### Erro: "database locked"

**Problema:** Múltiplas conexões tentando escrever no SQLite

**Solução:**

```bash
# Reiniciar o backend
# O SQLite está configurado com WAL mode que minimiza locks
```

### Frontend não carrega dados do Open Finance

**Problema:** Backend não está rodando ou URL incorreta

**Verificação:**

1. Backend rodando? `curl http://localhost:3001/api/health`
2. URL correta em `src/src/services/openFinanceService.ts`
3. CORS habilitado no backend? (já está por padrão)

### Build falha com erros TypeScript

**Problema:** Tipos inconsistentes

**Solução:**

```bash
cd src
npx tsc --noEmit  # Verifica erros sem gerar arquivos
npm run build     # Build completo
```

## Variáveis de Ambiente (Opcional)

### Backend

Crie `server/.env` (se necessário):

```env
PORT=3001
NODE_ENV=development
```

### Frontend

Crie `src/.env` (se necessário):

```env
VITE_API_URL=http://localhost:3001/api
```

## Estrutura de Desenvolvimento

### Hot Reload

- **Frontend**: Vite com HMR (atualização instantânea)
- **Backend**: Node com `--watch` flag (reinicia automaticamente)

### Logs

- **Frontend**: Console do navegador (F12)
- **Backend**: Terminal onde está rodando

## Próximos Passos

Após instalação bem-sucedida:

1. ✅ Leia `docs/RESUMO_SOLICITACOES.md` para entender funcionalidades
2. ✅ Explore `docs/AGENTES_IA.md` para entender os agentes
3. ✅ Consulte `docs/LICOES_APRENDIDAS.md` para boas práticas
4. ✅ Comece a usar o sistema!

## Suporte

Para problemas não cobertos aqui:

1. Verifique os logs no terminal
2. Verifique o console do navegador
3. Confirme versões de Node.js e npm
4. Tente reinstalar dependências

## Checklist de Instalação

- [ ] Node.js v18+ instalado
- [ ] npm v9+ instalado
- [ ] Repositório clonado
- [ ] `npm run install:all` executado com sucesso
- [ ] Backend iniciado (porta 3001)
- [ ] Frontend iniciado (porta 5173)
- [ ] Banco de dados criado em `database/open_finance.db`
- [ ] Seeds aplicados com sucesso
- [ ] Teste de health check passou
- [ ] Interface web carregando
- [ ] Open Finance conectando
- [ ] Agentes IA respondendo

**Instalação completa! 🎉**

