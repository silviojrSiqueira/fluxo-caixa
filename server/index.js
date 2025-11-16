import express from 'express';
import cors from 'cors';
import pool, { initializeDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializa o banco de dados
await initializeDatabase();

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API Fluxo de Caixa funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota genérica GET - Lista todos os registros de uma tabela
app.get('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const validTables = [
      'usuarios', 'instituicoes', 'contas', 'cartoes',
      'transacoes', 'faturas_cartao', 'lancamentos_cartao',
      'investimentos', 'operacoes_credito', 'cotacoes', 'metas',
      'entradas_manuais'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    const result = await pool.query(`SELECT * FROM ${table}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota genérica GET - Busca um registro específico
app.get('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const validTables = [
      'usuarios', 'instituicoes', 'contas', 'cartoes',
      'transacoes', 'faturas_cartao', 'lancamentos_cartao',
      'investimentos', 'operacoes_credito', 'cotacoes', 'metas',
      'entradas_manuais'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota genérica POST - Cria novo registro
app.post('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const data = req.body;

    const validTables = [
      'usuarios', 'instituicoes', 'contas', 'cartoes',
      'transacoes', 'faturas_cartao', 'lancamentos_cartao',
      'investimentos', 'operacoes_credito', 'cotacoes', 'metas',
      'entradas_manuais'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    // Para entradas_manuais, incluir o id do corpo da requisição
    let columns, values, placeholders, sql;

    if (table === 'entradas_manuais' && data.id) {
      columns = Object.keys(data);
      values = columns.map(col => data[col]);
      placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
    } else {
      columns = Object.keys(data).filter(k => k !== 'id');
      values = columns.map(col => data[col]);
      placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
    }

    const result = await pool.query(sql, values);

    res.status(201).json({
      id: data.id || result.rows[0].id,
      message: 'Registro criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota genérica PUT - Atualiza registro
app.put('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const data = req.body;

    const validTables = [
      'usuarios', 'instituicoes', 'contas', 'cartoes',
      'transacoes', 'faturas_cartao', 'lancamentos_cartao',
      'investimentos', 'operacoes_credito', 'cotacoes', 'metas',
      'entradas_manuais'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    const columns = Object.keys(data).filter(k => k !== 'id');
    const values = columns.map(col => data[col]);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1}`;
    const result = await pool.query(sql, [...values, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota genérica DELETE - Remove registro
app.delete('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;

    const validTables = [
      'usuarios', 'instituicoes', 'contas', 'cartoes',
      'transacoes', 'faturas_cartao', 'lancamentos_cartao',
      'investimentos', 'operacoes_credito', 'cotacoes', 'metas',
      'entradas_manuais'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota especial - Snapshot completo do Open Finance
app.get('/api/open-finance/snapshot', async (req, res) => {
  try {
    const [
      usuarios,
      instituicoes,
      contas,
      cartoes,
      investimentos,
      operacoes_credito,
      cotacoes,
      transacoes_recentes
    ] = await Promise.all([
      pool.query('SELECT * FROM usuarios WHERE ativo = true'),
      pool.query('SELECT * FROM instituicoes WHERE ativo = true'),
      pool.query('SELECT * FROM contas WHERE ativo = true'),
      pool.query('SELECT * FROM cartoes WHERE ativo = true'),
      pool.query('SELECT * FROM investimentos WHERE ativo = true'),
      pool.query('SELECT * FROM operacoes_credito WHERE status = $1', ['ativo']),
      pool.query(`
        SELECT * FROM cotacoes 
        WHERE data_cotacao = (SELECT MAX(data_cotacao) FROM cotacoes)
      `),
      pool.query(`
        SELECT * FROM transacoes 
        WHERE data_transacao >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY data_transacao DESC
      `)
    ]);

    const snapshot = {
      usuarios: usuarios.rows,
      instituicoes: instituicoes.rows,
      contas: contas.rows,
      cartoes: cartoes.rows,
      investimentos: investimentos.rows,
      operacoes_credito: operacoes_credito.rows,
      cotacoes: cotacoes.rows,
      transacoes_recentes: transacoes_recentes.rows
    };

    res.json(snapshot);
  } catch (error) {
    console.error('Erro ao gerar snapshot:', error);
    res.status(500).json({ error: error.message });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});

export default app;

