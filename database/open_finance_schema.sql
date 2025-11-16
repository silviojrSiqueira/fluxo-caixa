-- Schema Open Finance - Fluxo de Caixa
-- Database: SQLite

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  telefone TEXT,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  ativo INTEGER DEFAULT 1
);

-- Tabela de Instituições Financeiras
CREATE TABLE IF NOT EXISTS instituicoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL, -- banco, corretora, cooperativa
  url_api TEXT,
  logo_url TEXT,
  ativo INTEGER DEFAULT 1
);

-- Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- corrente, poupanca, salario
  numero TEXT NOT NULL,
  agencia TEXT NOT NULL,
  saldo REAL DEFAULT 0,
  limite REAL DEFAULT 0,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ativo INTEGER DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

-- Tabela de Cartões
CREATE TABLE IF NOT EXISTS cartoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- credito, debito, multiplo
  numero_final TEXT NOT NULL, -- últimos 4 dígitos
  bandeira TEXT NOT NULL, -- visa, mastercard, elo
  limite REAL DEFAULT 0,
  limite_disponivel REAL DEFAULT 0,
  dia_fechamento INTEGER,
  dia_vencimento INTEGER,
  ativo INTEGER DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

-- Tabela de Transações Bancárias
CREATE TABLE IF NOT EXISTS transacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conta_id INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- entrada, saida
  categoria TEXT,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data_transacao DATE NOT NULL,
  data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  origem TEXT, -- manual, open_finance, importacao
  FOREIGN KEY (conta_id) REFERENCES contas(id)
);

-- Tabela de Faturas de Cartão
CREATE TABLE IF NOT EXISTS faturas_cartao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cartao_id INTEGER NOT NULL,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  valor_total REAL DEFAULT 0,
  valor_pago REAL DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_fechamento DATE NOT NULL,
  status TEXT DEFAULT 'aberta', -- aberta, fechada, paga, atrasada
  FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
);

-- Tabela de Lançamentos de Cartão
CREATE TABLE IF NOT EXISTS lancamentos_cartao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fatura_id INTEGER NOT NULL,
  cartao_id INTEGER NOT NULL,
  categoria TEXT,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  parcela_atual INTEGER DEFAULT 1,
  total_parcelas INTEGER DEFAULT 1,
  data_compra DATE NOT NULL,
  data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fatura_id) REFERENCES faturas_cartao(id),
  FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
);

-- Tabela de Investimentos
CREATE TABLE IF NOT EXISTS investimentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- cdb, lci, lca, tesouro_direto, acoes, fundos, previdencia
  nome TEXT NOT NULL,
  codigo TEXT,
  valor_aplicado REAL NOT NULL,
  valor_atual REAL NOT NULL,
  rentabilidade REAL DEFAULT 0,
  data_aplicacao DATE NOT NULL,
  data_vencimento DATE,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  liquidez TEXT, -- diaria, d+1, d+30, no_vencimento
  ativo INTEGER DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

-- Tabela de Operações de Crédito
CREATE TABLE IF NOT EXISTS operacoes_credito (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- emprestimo, financiamento, cheque_especial
  descricao TEXT NOT NULL,
  valor_original REAL NOT NULL,
  saldo_devedor REAL NOT NULL,
  taxa_juros REAL NOT NULL,
  parcela_atual INTEGER DEFAULT 0,
  total_parcelas INTEGER,
  valor_parcela REAL,
  dia_vencimento INTEGER,
  data_contratacao DATE NOT NULL,
  data_primeiro_vencimento DATE,
  status TEXT DEFAULT 'ativo', -- ativo, quitado, atrasado
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

-- Tabela de Cotações (Ações, Moedas, Índices)
CREATE TABLE IF NOT EXISTS cotacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL, -- PETR4, VALE3, USD, EUR, IBOV
  tipo TEXT NOT NULL, -- acao, moeda, indice
  nome TEXT NOT NULL,
  valor REAL NOT NULL,
  variacao REAL DEFAULT 0,
  data_cotacao DATE NOT NULL,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Metas Financeiras
CREATE TABLE IF NOT EXISTS metas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_alvo REAL NOT NULL,
  valor_atual REAL DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_limite DATE,
  categoria TEXT,
  status TEXT DEFAULT 'em_andamento', -- em_andamento, concluida, cancelada
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Entradas Manuais (Receitas/Despesas cadastradas pelo usuário)
CREATE TABLE IF NOT EXISTS entradas_manuais (
  id TEXT PRIMARY KEY,
  usuario_id INTEGER DEFAULT 1,
  tipo TEXT NOT NULL, -- receita, despesa
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data DATE NOT NULL,
  conta TEXT,
  recorrente INTEGER DEFAULT 0,
  frequencia TEXT, -- mensal, anual, semanal
  origem TEXT DEFAULT 'manual',
  data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contas_usuario ON contas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_usuario ON cartoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta ON transacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data_transacao);
CREATE INDEX IF NOT EXISTS idx_faturas_cartao ON faturas_cartao(cartao_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_fatura ON lancamentos_cartao(fatura_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_usuario ON investimentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_operacoes_usuario ON operacoes_credito(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_codigo ON cotacoes(codigo, data_cotacao);
CREATE INDEX IF NOT EXISTS idx_metas_usuario ON metas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entradas_usuario ON entradas_manuais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entradas_data ON entradas_manuais(data);

