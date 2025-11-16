# 🔄 Migração SQLite → PostgreSQL - Concluída!

## ✅ O Que Foi Feito

O sistema foi **completamente migrado** de SQLite para PostgreSQL!

---

## 📝 Arquivos Criados/Modificados

### Criados:
- ✅ `database/schema-postgres.sql` - Schema PostgreSQL completo
- ✅ `server/.env.example` - Exemplo de configuração
- ✅ `MIGRACAO_POSTGRESQL.md` - Este arquivo

### Modificados:
- ✅ `server/package.json` - Removido better-sqlite3, adicionado pg + dotenv
- ✅ `server/database.js` - Agora usa Pool do PostgreSQL
- ✅ `server/index.js` - Todas as queries convertidas para PostgreSQL

---

## 🚀 Como Usar Localmente

### Passo 1: Instalar PostgreSQL

#### macOS (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows:
Download: https://www.postgresql.org/download/windows/

### Passo 2: Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql postgres

# Criar banco
CREATE DATABASE fluxo_caixa;

# Sair
\q
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
cd server

# Copiar exemplo
cp .env.example .env

# Editar .env
nano .env
```

Conteúdo do `.env`:
```env
DATABASE_URL=postgresql://localhost:5432/fluxo_caixa
PORT=3001
NODE_ENV=development
```

### Passo 4: Instalar Dependências

```bash
cd server
npm install
```

### Passo 5: Rodar o Servidor

```bash
npm run dev
```

O servidor irá:
1. ✅ Conectar ao PostgreSQL
2. ✅ Criar todas as tabelas
3. ✅ Aplicar seeds automaticamente
4. ✅ Estar pronto para uso!

---

## 🎯 Deploy em Produção

### Render (Recomendado - Gratuito)

1. **Criar PostgreSQL Database:**
   - Dashboard do Render > New > PostgreSQL
   - Nome: `fluxo-caixa-db`
   - Plano: Free
   - Criar

2. **Copiar Internal Database URL**
   - Algo como: `postgresql://user:pass@hostname/database`

3. **Criar Web Service:**
   - New > Web Service
   - Conectar repositório GitHub
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node index.js`

4. **Configurar Environment Variables:**
   - `DATABASE_URL`: (cole a URL do banco)
   - `NODE_ENV`: `production`
   - `PORT`: `3001`

5. **Deploy!** 🚀

---

### Railway (Mais Fácil)

1. **Acesse:** https://railway.app
2. **New Project** > Deploy from GitHub
3. **Selecione** o repositório
4. **Add PostgreSQL:**
   - New > Database > PostgreSQL
5. **Railway conecta automaticamente!**
6. Pronto! ✅

---

## 🔧 Principais Mudanças Técnicas

### SQLite → PostgreSQL

| Recurso | SQLite | PostgreSQL |
|---------|--------|------------|
| Tipos de dados | `INTEGER`, `REAL`, `TEXT` | `SERIAL`, `DECIMAL`, `VARCHAR` |
| Boolean | `INTEGER` (0/1) | `BOOLEAN` (true/false) |
| Auto-increment | `AUTOINCREMENT` | `SERIAL` |
| Placeholders | `?` | `$1`, `$2`, `$3` |
| Queries | Síncronas | Assíncronas (await) |
| Conexão | Arquivo local | Pool de conexões |

### Exemplos de Conversão

**Antes (SQLite):**
```javascript
const row = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
```

**Depois (PostgreSQL):**
```javascript
const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
const row = result.rows[0];
```

---

## 📊 Schema PostgreSQL

### Tipos de Dados Otimizados:

- **IDs Numéricos**: `SERIAL` (auto-increment)
- **IDs String**: `VARCHAR(100)` (entradas_manuais)
- **Valores Monetários**: `DECIMAL(15, 2)` (precisão)
- **Percentuais**: `DECIMAL(8, 2)`
- **Booleanos**: `BOOLEAN` (não mais 0/1)
- **Datas**: `DATE` e `TIMESTAMP`

### Melhorias:

- ✅ **Constraints CASCADE**: Deleta relacionados automaticamente
- ✅ **Índices otimizados**: Performance em queries
- ✅ **Comentários**: Documentação no próprio banco
- ✅ **Tipos específicos**: Melhor validação de dados

---

## 🔍 Verificando a Migração

### 1. Teste o Health Check

```bash
curl http://localhost:3001/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "API Fluxo de Caixa funcionando",
  "timestamp": "..."
}
```

### 2. Verifique as Tabelas

```bash
# Conectar ao banco
psql fluxo_caixa

# Listar tabelas
\dt

# Ver estrutura de uma tabela
\d entradas_manuais

# Ver dados
SELECT * FROM usuarios;

# Sair
\q
```

### 3. Teste as Rotas

```bash
# Listar usuários
curl http://localhost:3001/api/usuarios

# Listar entradas manuais
curl http://localhost:3001/api/entradas_manuais

# Snapshot Open Finance
curl http://localhost:3001/api/open-finance/snapshot
```

---

## 🐛 Solução de Problemas

### Erro: "password authentication failed"

**Solução:**
```bash
# Resetar senha do usuário postgres
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nova_senha';
\q

# Atualizar DATABASE_URL
DATABASE_URL=postgresql://postgres:nova_senha@localhost:5432/fluxo_caixa
```

### Erro: "database fluxo_caixa does not exist"

**Solução:**
```bash
psql postgres
CREATE DATABASE fluxo_caixa;
\q
```

### Erro: "relation usuarios does not exist"

**Causa:** Schema não foi criado

**Solução:**
```bash
# Reinicie o servidor
# Ele cria as tabelas automaticamente
npm run dev
```

### Erro: "connect ECONNREFUSED"

**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Inicie o serviço pelo Services.msc
```

---

## 💾 Backup do Banco PostgreSQL

### Backup Manual:

```bash
# Backup completo
pg_dump fluxo_caixa > backup.sql

# Restaurar
psql fluxo_caixa < backup.sql
```

### Backup Automático (Produção):

- **Render**: Backups diários automáticos (free tier)
- **Railway**: Backups configuráveis
- **Heroku**: Backups automáticos com add-on

---

## 📈 Vantagens do PostgreSQL

### vs SQLite:

✅ **Concorrência**: Múltiplos writes simultâneos
✅ **Escalabilidade**: Suporta milhões de registros
✅ **Recursos Avançados**: JSON, Full-text search, etc
✅ **Deploy**: Suportado por todos os hosts gratuitos
✅ **Backups**: Ferramentas nativas robustas
✅ **Integridade**: Foreign keys com CASCADE
✅ **Performance**: Melhor em queries complexas

### Desvantagens (mínimas):

⚠️ **Setup**: Precisa instalar servidor
⚠️ **Memória**: Usa mais RAM que SQLite
⚠️ **Complexidade**: Configuração mais elaborada

---

## 🎯 Próximos Passos

Agora que está no PostgreSQL:

1. ✅ **Deploy no Render/Railway** (5 minutos)
2. ✅ **Configure backups automáticos**
3. ✅ **Teste com dados reais**
4. ✅ **Monitor performance** com pg_stat

---

## 📚 Recursos Úteis

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **node-postgres (pg)**: https://node-postgres.com/
- **Render Docs**: https://render.com/docs/databases
- **Railway Docs**: https://docs.railway.app/databases/postgresql

---

## ✅ Checklist de Migração

- [x] Instalar dependências (pg, dotenv)
- [x] Criar schema PostgreSQL
- [x] Converter database.js para pool
- [x] Converter todas as queries do index.js
- [x] Criar .env.example
- [x] Testar localmente
- [ ] Deploy em produção
- [ ] Configurar backups

---

## 🎉 Conclusão

Migração concluída com sucesso! 

O sistema agora:
- ✅ Usa PostgreSQL (production-ready)
- ✅ Está pronto para deploy gratuito
- ✅ Suporta escalabilidade
- ✅ Tem melhor performance
- ✅ Backups automáticos em produção

**Hora de colocar no ar! 🚀**

---

**Data da Migração:** 13 de Novembro de 2025
**Versão:** 2.0.0 (PostgreSQL)

