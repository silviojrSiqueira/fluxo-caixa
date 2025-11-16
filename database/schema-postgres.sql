-- Schema PostgreSQL - Fluxo de Caixa
-- Database: PostgreSQL

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefone VARCHAR(20),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de Instituições Financeiras
CREATE TABLE IF NOT EXISTS instituicoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  url_api TEXT,
  logo_url TEXT,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  agencia VARCHAR(20) NOT NULL,
  saldo DECIMAL(15, 2) DEFAULT 0,
  limite DECIMAL(15, 2) DEFAULT 0,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
);

-- Tabela de Cartões
CREATE TABLE IF NOT EXISTS cartoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  numero_final VARCHAR(4) NOT NULL,
  bandeira VARCHAR(50) NOT NULL,
  limite DECIMAL(15, 2) DEFAULT 0,
  limite_disponivel DECIMAL(15, 2) DEFAULT 0,
  dia_fechamento INTEGER,
  dia_vencimento INTEGER,
  ativo BOOLEAN DEFAULT true,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
);

-- Tabela de Transações Bancárias
CREATE TABLE IF NOT EXISTS transacoes (
  id SERIAL PRIMARY KEY,
  conta_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  categoria VARCHAR(100),
  descricao TEXT NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_transacao DATE NOT NULL,
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  origem VARCHAR(50),
  FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE
);

-- Tabela de Faturas de Cartão
CREATE TABLE IF NOT EXISTS faturas_cartao (
  id SERIAL PRIMARY KEY,
  cartao_id INTEGER NOT NULL,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  valor_total DECIMAL(15, 2) DEFAULT 0,
  valor_pago DECIMAL(15, 2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_fechamento DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'aberta',
  FOREIGN KEY (cartao_id) REFERENCES cartoes(id) ON DELETE CASCADE
);

-- Tabela de Lançamentos de Cartão
CREATE TABLE IF NOT EXISTS lancamentos_cartao (
  id SERIAL PRIMARY KEY,
  fatura_id INTEGER NOT NULL,
  cartao_id INTEGER NOT NULL,
  categoria VARCHAR(100),
  descricao TEXT NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  parcela_atual INTEGER DEFAULT 1,
  total_parcelas INTEGER DEFAULT 1,
  data_compra DATE NOT NULL,
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fatura_id) REFERENCES faturas_cartao(id) ON DELETE CASCADE,
  FOREIGN KEY (cartao_id) REFERENCES cartoes(id) ON DELETE CASCADE
);

-- Tabela de Investimentos
CREATE TABLE IF NOT EXISTS investimentos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(50),
  valor_aplicado DECIMAL(15, 2) NOT NULL,
  valor_atual DECIMAL(15, 2) NOT NULL,
  rentabilidade DECIMAL(8, 2) DEFAULT 0,
  data_aplicacao DATE NOT NULL,
  data_vencimento DATE,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  liquidez VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
);

-- Tabela de Operações de Crédito
CREATE TABLE IF NOT EXISTS operacoes_credito (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  instituicao_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  saldo_devedor DECIMAL(15, 2) NOT NULL,
  taxa_juros DECIMAL(8, 2) NOT NULL,
  parcela_atual INTEGER DEFAULT 0,
  total_parcelas INTEGER,
  valor_parcela DECIMAL(15, 2),
  dia_vencimento INTEGER,
  data_contratacao DATE NOT NULL,
  data_primeiro_vencimento DATE,
  status VARCHAR(20) DEFAULT 'ativo',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
);

-- Tabela de Cotações (Ações, Moedas, Índices)
CREATE TABLE IF NOT EXISTS cotacoes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  valor DECIMAL(15, 4) NOT NULL,
  variacao DECIMAL(8, 2) DEFAULT 0,
  data_cotacao DATE NOT NULL,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Metas Financeiras
CREATE TABLE IF NOT EXISTS metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor_alvo DECIMAL(15, 2) NOT NULL,
  valor_atual DECIMAL(15, 2) DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_limite DATE,
  categoria VARCHAR(100),
  status VARCHAR(20) DEFAULT 'em_andamento',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Entradas Manuais (Receitas/Despesas cadastradas pelo usuário)
CREATE TABLE IF NOT EXISTS entradas_manuais (
  id VARCHAR(100) PRIMARY KEY,
  usuario_id INTEGER DEFAULT 1,
  tipo VARCHAR(20) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data DATE NOT NULL,
  conta VARCHAR(100),
  recorrente BOOLEAN DEFAULT false,
  frequencia VARCHAR(20),
  origem VARCHAR(50) DEFAULT 'manual',
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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

-- Comentários nas tabelas
COMMENT ON TABLE usuarios IS 'Usuários do sistema';
COMMENT ON TABLE instituicoes IS 'Instituições financeiras (bancos, corretoras)';
COMMENT ON TABLE contas IS 'Contas bancárias dos usuários';
COMMENT ON TABLE cartoes IS 'Cartões de crédito e débito';
COMMENT ON TABLE transacoes IS 'Transações bancárias';
COMMENT ON TABLE investimentos IS 'Investimentos dos usuários';
COMMENT ON TABLE operacoes_credito IS 'Empréstimos e financiamentos';
COMMENT ON TABLE cotacoes IS 'Cotações de ações, moedas e índices';
COMMENT ON TABLE entradas_manuais IS 'Entradas manuais de receitas e despesas';

