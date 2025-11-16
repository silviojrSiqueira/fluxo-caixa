# Fluxo de Caixa

Sistema completo de gerenciamento de fluxo de caixa com integração Open Finance e agentes de IA especializados.

## 🚀 Funcionalidades

- **Gestão de Transações**: Cadastro manual de receitas e despesas
- **Integração Open Finance**: Consolidação automática de contas, cartões, investimentos
- **Agentes IA Especializados**:
  - Agente Financeiro: Análises de financiamentos, amortizações, cartões
  - Agente de Investimentos: Oportunidades, simulações, rebalanceamento
  - Chat Geral: Respostas sobre fluxo de caixa
- **Sistema de Regras**: Regras condicionais com sugestões proativas
- **Exportação Excel**: Relatórios com projeções de 12 meses
- **Protótipo Mobile**: Interface responsiva em `/mobile-preview`

## 🏗️ Arquitetura

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express (ESM)
- **Banco de Dados**: SQLite (better-sqlite3)

## 📦 Instalação

```bash
# Instalar todas as dependências
npm run install:all

# Ou manualmente:
npm install
cd src && npm install
cd ../server && npm install
```

## 🎯 Como Usar

```bash
# Desenvolvimento (frontend + backend)
npm run dev

# Ou separadamente:
npm run dev:frontend  # Porta 5173
npm run dev:backend   # Porta 3001

# Build de produção
npm run build
```

## 📱 Rotas

- `/` - Interface web principal
- `/mobile-preview` - Protótipo mobile

## 📚 Documentação

Consulte a pasta `docs/` para documentação detalhada:
- `RESUMO_SOLICITACOES.md` - Histórico de funcionalidades
- `LICOES_APRENDIDAS.md` - Boas práticas e lições
- `AGENTES_IA*.md` - Documentação dos agentes

## 🛠️ Tecnologias

- React 18
- TypeScript
- Vite
- Express
- SQLite
- ExcelJS
- Recharts (gráficos)

## 📄 Licença

MIT

