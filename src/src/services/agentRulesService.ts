import { RegraIA, PlanilhaData, OpenFinanceSnapshot } from '../types';

export interface AvaliacaoRegra {
  regra: RegraIA;
  ativada: boolean;
  mensagem: string;
}

export class AgentRulesService {
  static avaliarRegras(
    regras: RegraIA[],
    planilha: PlanilhaData,
    snapshot?: OpenFinanceSnapshot
  ): AvaliacaoRegra[] {
    return regras
      .filter(r => r.ativa)
      .map(regra => this.avaliarRegra(regra, planilha, snapshot))
      .filter(av => av.ativada);
  }

  private static avaliarRegra(
    regra: RegraIA,
    planilha: PlanilhaData,
    snapshot?: OpenFinanceSnapshot
  ): AvaliacaoRegra {
    const contexto = this.construirContexto(planilha, snapshot);
    
    try {
      // Avalia a condição (simulação simples)
      const ativada = this.avaliarCondicao(regra.condicao, contexto);
      
      if (ativada) {
        const mensagem = this.executarAcao(regra.acao, contexto);
        return { regra, ativada: true, mensagem };
      }
    } catch (error) {
      console.error('Erro ao avaliar regra:', error);
    }

    return { regra, ativada: false, mensagem: '' };
  }

  private static construirContexto(planilha: PlanilhaData, snapshot?: OpenFinanceSnapshot) {
    const receitas = planilha.entradas
      .filter(e => e.tipo === 'receita')
      .reduce((acc, e) => acc + e.valor, 0);
    
    const despesas = planilha.entradas
      .filter(e => e.tipo === 'despesa')
      .reduce((acc, e) => acc + e.valor, 0);
    
    const saldo = receitas - despesas;

    const saldoContas = snapshot?.contas?.reduce((acc, c) => acc + c.saldo, 0) || 0;
    const totalInvestimentos = snapshot?.investimentos?.reduce((acc, i) => acc + i.valor_atual, 0) || 0;
    const totalDividas = snapshot?.operacoes_credito?.reduce((acc, o) => acc + o.saldo_devedor, 0) || 0;

    return {
      receitas,
      despesas,
      saldo,
      saldoContas,
      totalInvestimentos,
      totalDividas,
      patrimonioLiquido: saldoContas + totalInvestimentos - totalDividas,
      numeroEntradas: planilha.entradas.length
    };
  }

  private static avaliarCondicao(condicao: string, contexto: any): boolean {
    const condicaoLower = condicao.toLowerCase();

    // Regras de saldo negativo
    if (condicaoLower.includes('saldo') && condicaoLower.includes('negativo')) {
      return contexto.saldo < 0;
    }

    if (condicaoLower.includes('saldo') && condicaoLower.includes('positivo')) {
      return contexto.saldo > 0;
    }

    // Regras de despesas altas
    if (condicaoLower.includes('despesa') && condicaoLower.includes('alta')) {
      return contexto.despesas > contexto.receitas * 0.8;
    }

    // Regras de dívidas
    if (condicaoLower.includes('dívida') || condicaoLower.includes('divida')) {
      if (condicaoLower.includes('alta')) {
        return contexto.totalDividas > contexto.receitas * 3;
      }
      return contexto.totalDividas > 0;
    }

    // Regras de investimentos
    if (condicaoLower.includes('investimento') && condicaoLower.includes('baixo')) {
      return contexto.totalInvestimentos < contexto.receitas * 6;
    }

    // Regras de patrimônio
    if (condicaoLower.includes('patrimônio') || condicaoLower.includes('patrimonio')) {
      if (condicaoLower.includes('cresceu')) {
        return contexto.patrimonioLiquido > 0;
      }
    }

    // Regras de cartão
    if (condicaoLower.includes('cartão') || condicaoLower.includes('cartao')) {
      if (condicaoLower.includes('limite')) {
        // Implementar lógica específica se snapshot disponível
        return false;
      }
    }

    return false;
  }

  private static executarAcao(acao: string, contexto: any): string {
    const acaoLower = acao.toLowerCase();

    if (acaoLower.includes('alerta') || acaoLower.includes('avisar')) {
      return this.gerarAlerta(acao, contexto);
    }

    if (acaoLower.includes('sugerir') || acaoLower.includes('recomend')) {
      return this.gerarSugestao(acao, contexto);
    }

    return acao; // Retorna a ação como mensagem padrão
  }

  private static gerarAlerta(acao: string, contexto: any): string {
    if (contexto.saldo < 0) {
      return `⚠️ ALERTA: Seu saldo está negativo em R$ ${Math.abs(contexto.saldo).toFixed(2)}. Revise suas despesas urgentemente!`;
    }

    if (contexto.totalDividas > contexto.receitas * 3) {
      return `⚠️ ALERTA: Suas dívidas (R$ ${contexto.totalDividas.toFixed(2)}) representam mais de 3x suas receitas mensais. Priorize quitação!`;
    }

    if (contexto.despesas > contexto.receitas * 0.9) {
      return `⚠️ ALERTA: Suas despesas estão em ${((contexto.despesas / contexto.receitas) * 100).toFixed(0)}% da receita. Economize mais!`;
    }

    return `⚠️ ${acao}`;
  }

  private static gerarSugestao(acao: string, contexto: any): string {
    if (contexto.saldo > contexto.receitas * 0.3) {
      return `💡 SUGESTÃO: Você tem um bom saldo (R$ ${contexto.saldo.toFixed(2)}). Considere investir parte dele!`;
    }

    if (contexto.totalInvestimentos < contexto.receitas * 6) {
      return `💡 SUGESTÃO: Aumente seus investimentos! Alvo: 6 meses de receita como reserva de emergência.`;
    }

    if (contexto.totalDividas > 0) {
      return `💡 SUGESTÃO: Você tem R$ ${contexto.totalDividas.toFixed(2)} em dívidas. Priorize quitá-las antes de novos investimentos.`;
    }

    return `💡 ${acao}`;
  }

  static criarRegraExemplo(tipo: 'alerta' | 'sugestao'): Partial<RegraIA> {
    if (tipo === 'alerta') {
      return {
        titulo: 'Alerta de Saldo Negativo',
        condicao: 'saldo negativo',
        acao: 'Avisar sobre saldo negativo',
        tipo: 'alerta',
        prioridade: 'alta',
        ativa: true
      };
    } else {
      return {
        titulo: 'Sugestão de Investimento',
        condicao: 'saldo positivo alto',
        acao: 'Sugerir investimento do excedente',
        tipo: 'sugestao',
        prioridade: 'media',
        ativa: true
      };
    }
  }
}

