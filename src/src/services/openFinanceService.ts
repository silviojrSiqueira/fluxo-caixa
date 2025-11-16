import { OpenFinanceSnapshot, Entrada, PlanilhaData } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export class OpenFinanceService {
  static async buscarSnapshot(): Promise<OpenFinanceSnapshot> {
    try {
      const response = await fetch(`${API_BASE_URL}/open-finance/snapshot`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar snapshot Open Finance:', error);
      throw new Error('Falha ao conectar com o serviço Open Finance');
    }
  }

  static async buscarContas() {
    try {
      const response = await fetch(`${API_BASE_URL}/contas`);
      if (!response.ok) throw new Error('Erro ao buscar contas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw error;
    }
  }

  static async buscarCartoes() {
    try {
      const response = await fetch(`${API_BASE_URL}/cartoes`);
      if (!response.ok) throw new Error('Erro ao buscar cartões');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
      throw error;
    }
  }

  static async buscarInvestimentos() {
    try {
      const response = await fetch(`${API_BASE_URL}/investimentos`);
      if (!response.ok) throw new Error('Erro ao buscar investimentos');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      throw error;
    }
  }

  static async buscarOperacoesCredito() {
    try {
      const response = await fetch(`${API_BASE_URL}/operacoes_credito`);
      if (!response.ok) throw new Error('Erro ao buscar operações de crédito');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar operações de crédito:', error);
      throw error;
    }
  }

  static async buscarCotacoes() {
    try {
      const response = await fetch(`${API_BASE_URL}/cotacoes`);
      if (!response.ok) throw new Error('Erro ao buscar cotações');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      throw error;
    }
  }

  static converterSnapshotParaEntradas(snapshot: OpenFinanceSnapshot): Entrada[] {
    const entradas: Entrada[] = [];

    // Converte transações recentes
    if (snapshot.transacoes_recentes) {
      snapshot.transacoes_recentes.forEach(transacao => {
        entradas.push({
          id: `of-trans-${transacao.id}`,
          tipo: transacao.tipo === 'entrada' ? 'receita' : 'despesa',
          categoria: transacao.categoria || 'Open Finance',
          descricao: transacao.descricao,
          valor: Math.abs(parseFloat(transacao.valor) || 0),
          data: transacao.data_transacao,
          origem: 'open_finance'
        });
      });
    }

    // Adiciona saldo de investimentos como receita potencial
    if (snapshot.investimentos) {
      snapshot.investimentos.forEach(inv => {
        const valorAtual = parseFloat(inv.valor_atual) || 0;
        const valorAplicado = parseFloat(inv.valor_aplicado) || 0;
        const rendimento = valorAtual - valorAplicado;
        if (rendimento > 0) {
          entradas.push({
            id: `of-inv-${inv.id}`,
            tipo: 'receita',
            categoria: 'Investimentos',
            descricao: `Rendimento ${inv.nome}`,
            valor: rendimento,
            data: inv.data_atualizacao,
            origem: 'open_finance'
          });
        }
      });
    }

    return entradas;
  }

  static integrarPlanilhaComOpenFinance(
    planilhaData: PlanilhaData, 
    snapshot: OpenFinanceSnapshot
  ): PlanilhaData {
    const entradasOpenFinance = this.converterSnapshotParaEntradas(snapshot);
    
    // Remove entradas antigas do Open Finance
    const entradasManuais = planilhaData.entradas.filter(
      e => e.origem !== 'open_finance'
    );
    
    // Combina entradas manuais com as novas do Open Finance
    const entradasIntegradas = [...entradasManuais, ...entradasOpenFinance];
    
    return {
      ...planilhaData,
      entradas: entradasIntegradas
    };
  }

  static calcularResumoFinanceiro(snapshot: OpenFinanceSnapshot) {
    const saldoContas = snapshot.contas?.reduce((acc, conta) => acc + (parseFloat(conta.saldo) || 0), 0) || 0;
    const totalInvestimentos = snapshot.investimentos?.reduce((acc, inv) => acc + (parseFloat(inv.valor_atual) || 0), 0) || 0;
    const totalDividas = snapshot.operacoes_credito?.reduce((acc, op) => acc + (parseFloat(op.saldo_devedor) || 0), 0) || 0;
    const limiteCartoes = snapshot.cartoes?.reduce((acc, cartao) => acc + (parseFloat(cartao.limite_disponivel) || 0), 0) || 0;

    return {
      saldoContas,
      totalInvestimentos,
      totalDividas,
      limiteCartoes,
      patrimonioLiquido: saldoContas + totalInvestimentos - totalDividas
    };
  }
}

