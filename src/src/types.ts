// Tipos de Dados

export interface Entrada {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  conta?: string;
  recorrente?: boolean;
  frequencia?: 'mensal' | 'anual' | 'semanal';
  origem?: 'manual' | 'open_finance' | 'importacao';
}

export interface PlanilhaData {
  entradas: Entrada[];
  categorias: string[];
  contas: string[];
}

export interface OpenFinanceSnapshot {
  usuarios: Usuario[];
  instituicoes: Instituicao[];
  contas: Conta[];
  cartoes: Cartao[];
  investimentos: Investimento[];
  operacoes_credito: OperacaoCredito[];
  cotacoes: Cotacao[];
  transacoes_recentes: Transacao[];
}

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  data_cadastro: string;
  ativo: number;
}

export interface Instituicao {
  id: number;
  nome: string;
  codigo: string;
  tipo: string;
  url_api?: string;
  logo_url?: string;
  ativo: number;
}

export interface Conta {
  id: number;
  usuario_id: number;
  instituicao_id: number;
  tipo: string;
  numero: string;
  agencia: string;
  saldo: number;
  limite: number;
  data_atualizacao: string;
  ativo: number;
}

export interface Cartao {
  id: number;
  usuario_id: number;
  instituicao_id: number;
  tipo: string;
  numero_final: string;
  bandeira: string;
  limite: number;
  limite_disponivel: number;
  dia_fechamento: number;
  dia_vencimento: number;
  ativo: number;
}

export interface Transacao {
  id: number;
  conta_id: number;
  tipo: string;
  categoria?: string;
  descricao: string;
  valor: number;
  data_transacao: string;
  data_registro: string;
  origem?: string;
}

export interface Investimento {
  id: number;
  usuario_id: number;
  instituicao_id: number;
  tipo: string;
  nome: string;
  codigo?: string;
  valor_aplicado: number;
  valor_atual: number;
  rentabilidade: number;
  data_aplicacao: string;
  data_vencimento?: string;
  data_atualizacao: string;
  liquidez: string;
  ativo: number;
}

export interface OperacaoCredito {
  id: number;
  usuario_id: number;
  instituicao_id: number;
  tipo: string;
  descricao: string;
  valor_original: number;
  saldo_devedor: number;
  taxa_juros: number;
  parcela_atual: number;
  total_parcelas?: number;
  valor_parcela?: number;
  dia_vencimento?: number;
  data_contratacao: string;
  data_primeiro_vencimento?: string;
  status: string;
}

export interface Cotacao {
  id: number;
  codigo: string;
  tipo: string;
  nome: string;
  valor: number;
  variacao: number;
  data_cotacao: string;
  data_atualizacao: string;
}

export interface RegraIA {
  id: string;
  titulo: string;
  condicao: string;
  acao: string;
  ativa: boolean;
  tipo: 'alerta' | 'sugestao' | 'automacao';
  prioridade: 'baixa' | 'media' | 'alta';
}

export interface MensagemChat {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ProjecaoConfig {
  meses: number;
  incluirCartoes: boolean;
  incluirDespesasGerais: boolean;
  taxaCrescimento?: number;
}

export interface SimulatedTransfer {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
}

export interface DadosFluxoMensal {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

