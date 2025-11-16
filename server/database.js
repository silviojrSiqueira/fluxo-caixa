import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema-postgres.sql');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/fluxo_caixa',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool do PostgreSQL:', err);
  process.exit(-1);
});

// Inicializa o banco de dados
export async function initializeDatabase() {
  console.log('🔄 Inicializando banco de dados PostgreSQL...');
  
  try {
    // Lê e executa o schema SQL
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    await pool.query(schema);
    
    console.log('✅ Schema criado/verificado com sucesso');
    
    // Aplica seeds se as tabelas estiverem vazias
    await applySeedsIfNeeded();
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  }
}

// Seeds automáticos
async function applySeedsIfNeeded() {
  try {
    // Verifica se já existem dados
    const result = await pool.query('SELECT COUNT(*) as count FROM usuarios');
    const usuariosCount = parseInt(result.rows[0].count);
    
    if (usuariosCount > 0) {
      console.log('ℹ️  Banco já possui dados, pulando seeds');
      return;
    }
    
    console.log('🌱 Aplicando seeds...');
    
    // Usuário padrão
    await pool.query(`
      INSERT INTO usuarios (nome, cpf, email, telefone) 
      VALUES ($1, $2, $3, $4)
    `, ['Usuário Demo', '12345678900', 'demo@fluxocaixa.com', '11999999999']);
    
    // Instituições
    const instituicoes = [
      ['Banco do Brasil', 'BB', 'banco', 'https://www.bb.com.br', null],
      ['Caixa Econômica', 'CEF', 'banco', 'https://www.caixa.gov.br', null],
      ['Itaú Unibanco', 'ITAU', 'banco', 'https://www.itau.com.br', null],
      ['Bradesco', 'BRADESCO', 'banco', 'https://www.bradesco.com.br', null],
      ['Santander', 'SANTANDER', 'banco', 'https://www.santander.com.br', null],
      ['Nubank', 'NUBANK', 'banco', 'https://nubank.com.br', null],
      ['Inter', 'INTER', 'banco', 'https://www.bancointer.com.br', null],
      ['XP Investimentos', 'XP', 'corretora', 'https://www.xpi.com.br', null],
      ['BTG Pactual', 'BTG', 'corretora', 'https://www.btgpactual.com', null]
    ];
    
    for (const inst of instituicoes) {
      await pool.query(`
        INSERT INTO instituicoes (nome, codigo, tipo, url_api, logo_url) 
        VALUES ($1, $2, $3, $4, $5)
      `, inst);
    }
    
    // Contas de exemplo
    const contas = [
      [1, 1, 'corrente', '12345-6', '0001-9', 5000.00, 1000.00],
      [1, 6, 'corrente', '98765-4', '0001', 3500.00, 0],
      [1, 2, 'poupanca', '55555-5', '0013', 10000.00, 0]
    ];
    
    for (const conta of contas) {
      await pool.query(`
        INSERT INTO contas (usuario_id, instituicao_id, tipo, numero, agencia, saldo, limite) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, conta);
    }
    
    // Cartões de exemplo
    const cartoes = [
      [1, 3, 'credito', '1234', 'Visa', 5000.00, 4500.00, 10, 17],
      [1, 4, 'credito', '5678', 'Mastercard', 8000.00, 7200.00, 15, 22],
      [1, 6, 'credito', '9999', 'Mastercard', 3000.00, 3000.00, 5, 12]
    ];
    
    for (const cartao of cartoes) {
      await pool.query(`
        INSERT INTO cartoes (usuario_id, instituicao_id, tipo, numero_final, bandeira, limite, limite_disponivel, dia_fechamento, dia_vencimento) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, cartao);
    }
    
    // Investimentos de exemplo
    const investimentos = [
      [1, 8, 'acoes', 'Petrobras PN', 'PETR4', 5000.00, 5500.00, 10.00, '2024-01-15', null, 'diaria'],
      [1, 8, 'acoes', 'Vale ON', 'VALE3', 3000.00, 3200.00, 6.67, '2024-02-01', null, 'diaria'],
      [1, 9, 'cdb', 'CDB 120% CDI', 'CDB-BTG-001', 10000.00, 10450.00, 4.50, '2024-01-10', '2025-01-10', 'no_vencimento'],
      [1, 8, 'tesouro_direto', 'Tesouro Selic 2027', 'SELIC-2027', 15000.00, 15350.00, 2.33, '2023-06-15', '2027-03-01', 'd+1']
    ];
    
    for (const inv of investimentos) {
      await pool.query(`
        INSERT INTO investimentos (usuario_id, instituicao_id, tipo, nome, codigo, valor_aplicado, valor_atual, rentabilidade, data_aplicacao, data_vencimento, liquidez) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, inv);
    }
    
    // Cotações de exemplo
    const cotacoes = [
      ['PETR4', 'acao', 'Petrobras PN', 38.45, 2.5, '2024-11-13'],
      ['VALE3', 'acao', 'Vale ON', 62.30, -1.2, '2024-11-13'],
      ['ITUB4', 'acao', 'Itaú Unibanco PN', 28.90, 0.8, '2024-11-13'],
      ['BBDC4', 'acao', 'Bradesco PN', 14.25, -0.5, '2024-11-13'],
      ['USD', 'moeda', 'Dólar Americano', 5.75, 0.3, '2024-11-13'],
      ['EUR', 'moeda', 'Euro', 6.20, 0.2, '2024-11-13'],
      ['IBOV', 'indice', 'Ibovespa', 128500.00, 1.5, '2024-11-13']
    ];
    
    for (const cot of cotacoes) {
      await pool.query(`
        INSERT INTO cotacoes (codigo, tipo, nome, valor, variacao, data_cotacao) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, cot);
    }
    
    // Operações de crédito de exemplo
    const operacoes = [
      [1, 1, 'financiamento', 'Financiamento Veículo', 35000.00, 28000.00, 1.99, 24, 60, 1580.00, 10, '2023-06-01', '2023-07-10', 'ativo'],
      [1, 2, 'emprestimo', 'Empréstimo Consignado', 10000.00, 7500.00, 1.50, 18, 36, 350.00, 15, '2023-09-15', '2023-10-15', 'ativo']
    ];
    
    for (const op of operacoes) {
      await pool.query(`
        INSERT INTO operacoes_credito (usuario_id, instituicao_id, tipo, descricao, valor_original, saldo_devedor, taxa_juros, parcela_atual, total_parcelas, valor_parcela, dia_vencimento, data_contratacao, data_primeiro_vencimento, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, op);
    }
    
    console.log('✅ Seeds aplicados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao aplicar seeds:', error);
    throw error;
  }
}

// Exporta o pool como default
export default pool;
