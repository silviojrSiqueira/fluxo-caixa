# 🐘 Guia de Instalação do PostgreSQL - Local

## 📋 Para macOS (Você está aqui!)

### Opção 1: Homebrew (Recomendado) ⭐

#### Passo 1: Instalar Homebrew (se não tiver)

```bash
# Verificar se já tem Homebrew
brew --version

# Se não tiver, instalar:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Passo 2: Instalar PostgreSQL

```bash
# Instalar PostgreSQL 15
brew install postgresql@15

# Ou simplesmente (última versão)
brew install postgresql
```

#### Passo 3: Iniciar o Serviço

```bash
# Iniciar agora e sempre que o Mac ligar
brew services start postgresql@15

# Ou apenas iniciar agora (não inicia automaticamente)
pg_ctl -D /opt/homebrew/var/postgresql@15 start
```

#### Passo 4: Verificar Instalação

```bash
# Verificar versão
postgres --version

# Deve mostrar algo como: postgres (PostgreSQL) 15.x
```

#### Passo 5: Acessar PostgreSQL

```bash
# Conectar ao PostgreSQL
psql postgres

# Você verá um prompt assim:
# postgres=#
```

#### Passo 6: Criar o Banco de Dados

Dentro do `psql`:

```sql
-- Criar banco de dados
CREATE DATABASE fluxo_caixa;

-- Listar bancos (verificar se foi criado)
\l

-- Conectar ao banco criado
\c fluxo_caixa

-- Sair
\q
```

---

### Opção 2: Postgres.app (Interface Gráfica)

#### Passo 1: Download

1. Acesse: https://postgresapp.com/
2. Baixe o Postgres.app
3. Arraste para Applications

#### Passo 2: Iniciar

1. Abra o Postgres.app
2. Clique em "Initialize" para criar o cluster padrão
3. Clique em "Start"

#### Passo 3: Configurar PATH

```bash
# Adicionar ao PATH (necessário para usar psql no terminal)
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc

# Recarregar
source ~/.zshrc
```

#### Passo 4: Criar Banco

```bash
# Abrir psql
psql

# Criar banco
CREATE DATABASE fluxo_caixa;
\q
```

---

## 🔧 Configuração do Projeto

### Passo 1: Criar arquivo .env

```bash
cd server
touch .env
```

### Passo 2: Editar .env

Abra `server/.env` e adicione:

```env
DATABASE_URL=postgresql://localhost:5432/fluxo_caixa
PORT=3001
NODE_ENV=development
```

**Nota:** Se você criou um usuário/senha específicos, use:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/fluxo_caixa
```

### Passo 3: Instalar Dependências

```bash
cd server
npm install
```

### Passo 4: Testar Conexão

```bash
npm run dev
```

Você deve ver:
```
✅ Conectado ao PostgreSQL
🔄 Inicializando banco de dados PostgreSQL...
✅ Schema criado/verificado com sucesso
🌱 Aplicando seeds...
✅ Seeds aplicados com sucesso
🚀 Servidor rodando em http://localhost:3001
```

---

## 🧪 Testando o PostgreSQL

### Via Terminal (psql)

```bash
# Conectar ao banco
psql fluxo_caixa

# Listar tabelas
\dt

# Ver estrutura de uma tabela
\d usuarios

# Fazer uma query
SELECT * FROM usuarios;

# Ver quantos registros em cada tabela
SELECT 
  schemaname,
  tablename,
  (SELECT count(*) FROM usuarios) as usuarios_count;

# Sair
\q
```

### Via Aplicação

```bash
# Testar API
curl http://localhost:3001/api/health

# Listar usuários
curl http://localhost:3001/api/usuarios

# Ver entradas manuais
curl http://localhost:3001/api/entradas_manuais
```

---

## 🛠️ Comandos Úteis do PostgreSQL

### Gerenciamento do Serviço

```bash
# Iniciar
brew services start postgresql@15

# Parar
brew services stop postgresql@15

# Reiniciar
brew services restart postgresql@15

# Ver status
brew services list
```

### Comandos psql

```bash
# Conectar a um banco específico
psql fluxo_caixa

# Conectar com usuário específico
psql -U usuario -d fluxo_caixa

# Executar comando SQL direto
psql fluxo_caixa -c "SELECT * FROM usuarios;"

# Executar script SQL
psql fluxo_caixa < database/schema-postgres.sql
```

### Dentro do psql (\comandos)

```sql
\l              -- Listar bancos de dados
\c banco        -- Conectar a um banco
\dt             -- Listar tabelas
\d tabela       -- Descrever tabela
\du             -- Listar usuários
\q              -- Sair
\?              -- Ajuda
\h              -- Ajuda SQL
```

---

## 🔒 Criar Usuário/Senha (Opcional)

Por padrão, PostgreSQL no Mac usa autenticação "trust" para localhost (sem senha).

Para criar usuário com senha:

```bash
psql postgres
```

```sql
-- Criar usuário
CREATE USER fluxo_admin WITH PASSWORD 'suasenha123';

-- Dar privilégios
GRANT ALL PRIVILEGES ON DATABASE fluxo_caixa TO fluxo_admin;

-- Sair
\q
```

Atualizar `.env`:
```env
DATABASE_URL=postgresql://fluxo_admin:suasenha123@localhost:5432/fluxo_caixa
```

---

## 🐛 Solução de Problemas

### Erro: "psql: command not found"

**Solução 1:** Adicionar ao PATH

```bash
# Para Homebrew Intel Mac
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

# Para Homebrew M1/M2 Mac
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

source ~/.zshrc
```

**Solução 2:** Usar caminho completo

```bash
/opt/homebrew/bin/psql postgres
```

### Erro: "connection refused"

**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
brew services start postgresql@15
```

### Erro: "database does not exist"

**Solução:**
```bash
psql postgres
CREATE DATABASE fluxo_caixa;
\q
```

### Erro: "role does not exist"

**Solução:**
```bash
# Criar seu usuário do sistema como superuser
psql postgres
CREATE USER seu_usuario WITH SUPERUSER;
\q
```

### PostgreSQL não inicia

**Verificar logs:**
```bash
tail -f /opt/homebrew/var/log/postgresql@15.log
```

**Resetar dados (⚠️ APAGA TUDO):**
```bash
brew services stop postgresql@15
rm -rf /opt/homebrew/var/postgresql@15
brew postgresql-upgrade-database
brew services start postgresql@15
```

---

## 🎯 Interface Gráfica (GUI)

### Opção 1: pgAdmin (Gratuito)

```bash
brew install --cask pgadmin4
```

1. Abra pgAdmin
2. Add New Server
3. Nome: Fluxo Caixa
4. Host: localhost
5. Port: 5432
6. Database: fluxo_caixa
7. Conectar

### Opção 2: Postico (Pago, mas bonito)

Download: https://eggerapps.at/postico/

### Opção 3: DBeaver (Gratuito, multi-DB)

```bash
brew install --cask dbeaver-community
```

---

## 📊 Verificar Instalação Completa

Execute este script de teste:

```bash
# Teste 1: PostgreSQL instalado?
postgres --version && echo "✅ PostgreSQL instalado"

# Teste 2: Serviço rodando?
brew services list | grep postgresql && echo "✅ Serviço ativo"

# Teste 3: Consegue conectar?
psql -c "SELECT version();" postgres && echo "✅ Conexão OK"

# Teste 4: Banco existe?
psql -lqt | cut -d \| -f 1 | grep -qw fluxo_caixa && echo "✅ Banco criado"

# Teste 5: Tem tabelas?
psql fluxo_caixa -c "\dt" && echo "✅ Tabelas criadas"
```

---

## 🔄 Desinstalar (se necessário)

```bash
# Parar serviço
brew services stop postgresql@15

# Desinstalar
brew uninstall postgresql@15

# Remover dados (opcional)
rm -rf /opt/homebrew/var/postgresql@15
```

---

## 📚 Recursos Adicionais

- **Documentação Oficial**: https://www.postgresql.org/docs/
- **Homebrew PostgreSQL**: https://formulae.brew.sh/formula/postgresql@15
- **Postgres.app**: https://postgresapp.com/documentation/
- **Tutorial psql**: https://www.postgresqltutorial.com/postgresql-administration/psql-commands/

---

## ✅ Checklist de Instalação

- [ ] PostgreSQL instalado (`postgres --version`)
- [ ] Serviço iniciado (`brew services start postgresql@15`)
- [ ] psql funcionando (`psql postgres`)
- [ ] Banco criado (`CREATE DATABASE fluxo_caixa;`)
- [ ] Arquivo `.env` criado em `server/`
- [ ] `DATABASE_URL` configurada
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor roda sem erros (`npm run dev`)
- [ ] API responde (`curl http://localhost:3001/api/health`)
- [ ] Tabelas criadas (verificar com `\dt`)

---

## 🎉 Próximos Passos

Após instalar e configurar:

1. **Rodar o backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Rodar o frontend:**
   ```bash
   cd src
   npm run dev
   ```

3. **Acessar:**
   - Frontend: http://localhost:4200
   - API: http://localhost:3001/api

4. **Testar:**
   - Adicionar uma entrada
   - Verificar se salvou no banco: `psql fluxo_caixa -c "SELECT * FROM entradas_manuais;"`

---

**Instalação concluída com sucesso! 🎉**

Precisa de ajuda? Qualquer erro, é só me avisar!

