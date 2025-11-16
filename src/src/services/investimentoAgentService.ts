import { MensagemChat, OpenFinanceSnapshot, Investimento } from '../types';

export class InvestimentoAgentService {
  static async chat(mensagens: MensagemChat[], snapshot?: OpenFinanceSnapshot): Promise<string> {
    const ultimaMensagem = mensagens[mensagens.length - 1];
    
    if (!ultimaMensagem || ultimaMensagem.role !== 'user') {
      return 'Como posso ajudar com seus investimentos?';
    }

    const pergunta = ultimaMensagem.content.toLowerCase();

    if (pergunta.includes('rebalance') || pergunta.includes('diversifica')) {
      return this.analisarRebalanceamento(snapshot);
    }

    if (pergunta.includes('resgate') || pergunta.includes('liquidez')) {
      return this.analisarLiquidez(snapshot);
    }

    if (pergunta.includes('rentabilidade') || pergunta.includes('rendimento')) {
      return this.analisarRentabilidade(snapshot);
    }

    if (pergunta.includes('aporte') || pergunta.includes('investir')) {
      return this.sugerirAportes(snapshot);
    }

    if (pergunta.includes('risco') || pergunta.includes('segur')) {
      return this.analisarRisco(snapshot);
    }

    return this.analiseGeral(snapshot);
  }

  private static analisarRentabilidade(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.investimentos || snapshot.investimentos.length === 0) {
      return 'ℹ️ Você ainda não possui investimentos cadastrados.';
    }

    let analise = `📈 **Análise de Rentabilidade**\n\n`;

    const totalAplicado = snapshot.investimentos.reduce((acc, inv) => acc + inv.valor_aplicado, 0);
    const totalAtual = snapshot.investimentos.reduce((acc, inv) => acc + inv.valor_atual, 0);
    const rendimentoTotal = totalAtual - totalAplicado;
    const rentabilidadeMedia = (rendimentoTotal / totalAplicado) * 100;

    analise += `💰 **Resumo Geral:**\n`;
    analise += `• Total aplicado: R$ ${totalAplicado.toFixed(2)}\n`;
    analise += `• Valor atual: R$ ${totalAtual.toFixed(2)}\n`;
    analise += `• Rendimento: R$ ${rendimentoTotal.toFixed(2)}\n`;
    analise += `• Rentabilidade média: ${rentabilidadeMedia >= 0 ? '+' : ''}${rentabilidadeMedia.toFixed(2)}%\n\n`;

    analise += `📊 **Por Investimento:**\n\n`;

    const investimentosOrdenados = [...snapshot.investimentos].sort((a, b) => b.rentabilidade - a.rentabilidade);

    investimentosOrdenados.forEach((inv, idx) => {
      const rendimento = inv.valor_atual - inv.valor_aplicado;
      const emoji = inv.rentabilidade > 10 ? '🚀' : inv.rentabilidade > 5 ? '📈' : inv.rentabilidade > 0 ? '✅' : '📉';

      analise += `${emoji} **${idx + 1}. ${inv.nome}**\n`;
      analise += `   Tipo: ${inv.tipo}\n`;
      analise += `   Aplicado: R$ ${inv.valor_aplicado.toFixed(2)}\n`;
      analise += `   Atual: R$ ${inv.valor_atual.toFixed(2)}\n`;
      analise += `   Rendimento: R$ ${rendimento.toFixed(2)} (${inv.rentabilidade.toFixed(2)}%)\n`;
      analise += `   Liquidez: ${inv.liquidez}\n\n`;
    });

    if (rentabilidadeMedia < 5) {
      analise += `💡 **Sugestão:** Sua rentabilidade média está abaixo de 5%. `;
      analise += `Considere diversificar para ativos com maior potencial de retorno.`;
    }

    return analise;
  }

  private static analisarRebalanceamento(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.investimentos || snapshot.investimentos.length === 0) {
      return 'Você precisa ter investimentos para analisar rebalanceamento.';
    }

    let analise = `⚖️ **Análise de Rebalanceamento**\n\n`;

    const totalInvestido = snapshot.investimentos.reduce((acc, inv) => acc + inv.valor_atual, 0);
    const porTipo = new Map<string, number>();

    snapshot.investimentos.forEach(inv => {
      porTipo.set(inv.tipo, (porTipo.get(inv.tipo) || 0) + inv.valor_atual);
    });

    analise += `📊 **Alocação Atual:**\n\n`;

    Array.from(porTipo.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([tipo, valor]) => {
        const percentual = (valor / totalInvestido) * 100;
        analise += `• ${tipo}: R$ ${valor.toFixed(2)} (${percentual.toFixed(1)}%)\n`;
      });

    analise += `\n💡 **Recomendação de Alocação Ideal:**\n\n`;
    analise += `• Renda Fixa: 40-60% (baixo risco)\n`;
    analise += `• Ações: 20-40% (médio/alto risco)\n`;
    analise += `• Fundos: 10-20% (diversificação)\n`;
    analise += `• Reserva de emergência: 10-15% (liquidez diária)\n\n`;

    // Verificar desbalanceamento
    const percentualAcoes = ((porTipo.get('acoes') || 0) / totalInvestido) * 100;
    if (percentualAcoes > 50) {
      analise += `⚠️ **Alerta:** Você está com ${percentualAcoes.toFixed(1)}% em ações. `;
      analise += `Considere aumentar a posição em renda fixa para reduzir volatilidade.\n`;
    }

    return analise;
  }

  private static analisarLiquidez(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.investimentos || snapshot.investimentos.length === 0) {
      return 'Você não possui investimentos para analisar liquidez.';
    }

    let analise = `💧 **Análise de Liquidez**\n\n`;

    const porLiquidez = {
      diaria: 0,
      'd+1': 0,
      'd+30': 0,
      no_vencimento: 0
    };

    snapshot.investimentos.forEach(inv => {
      const liquidez = inv.liquidez.toLowerCase().replace(/\s/g, '_');
      if (liquidez in porLiquidez) {
        porLiquidez[liquidez as keyof typeof porLiquidez] += inv.valor_atual;
      }
    });

    const total = snapshot.investimentos.reduce((acc, inv) => acc + inv.valor_atual, 0);

    analise += `📊 **Distribuição por Liquidez:**\n\n`;
    analise += `✅ Liquidez diária: R$ ${porLiquidez.diaria.toFixed(2)} (${((porLiquidez.diaria / total) * 100).toFixed(1)}%)\n`;
    analise += `📅 D+1: R$ ${porLiquidez['d+1'].toFixed(2)} (${((porLiquidez['d+1'] / total) * 100).toFixed(1)}%)\n`;
    analise += `📅 D+30: R$ ${porLiquidez['d+30'].toFixed(2)} (${((porLiquidez['d+30'] / total) * 100).toFixed(1)}%)\n`;
    analise += `🔒 No vencimento: R$ ${porLiquidez.no_vencimento.toFixed(2)} (${((porLiquidez.no_vencimento / total) * 100).toFixed(1)}%)\n\n`;

    const liquidezImediata = porLiquidez.diaria + porLiquidez['d+1'];
    const percentualLiquidez = (liquidezImediata / total) * 100;

    if (percentualLiquidez < 20) {
      analise += `⚠️ **Alerta:** Apenas ${percentualLiquidez.toFixed(1)}% dos seus investimentos tem alta liquidez. `;
      analise += `Recomendo manter pelo menos 20% em ativos de fácil resgate para emergências.`;
    } else {
      analise += `✅ Você possui ${percentualLiquidez.toFixed(1)}% em investimentos de alta liquidez. Ótimo para emergências!`;
    }

    return analise;
  }

  private static sugerirAportes(snapshot?: OpenFinanceSnapshot): string {
    let analise = `💰 **Sugestões de Aportes**\n\n`;

    if (!snapshot?.investimentos || snapshot.investimentos.length === 0) {
      analise += `Comece sua jornada de investimentos:\n\n`;
      analise += `1️⃣ **Reserva de Emergência (prioridade máxima)**\n`;
      analise += `   • Tesouro Selic ou CDB com liquidez diária\n`;
      analise += `   • Meta: 6 meses de despesas\n\n`;
      analise += `2️⃣ **Renda Fixa**\n`;
      analise += `   • CDB, LCI, LCA\n`;
      analise += `   • Baixo risco, rentabilidade previsível\n\n`;
      analise += `3️⃣ **Renda Variável (após reserva)**\n`;
      analise += `   • Ações de empresas sólidas\n`;
      analise += `   • Fundos de índice (ETFs)\n`;

      return analise;
    }

    const total = snapshot.investimentos.reduce((acc, inv) => acc + inv.valor_atual, 0);
    analise += `Patrimônio atual: R$ ${total.toFixed(2)}\n\n`;

    // Análise do melhor investimento
    const melhorInvestimento = snapshot.investimentos.reduce((prev, current) => 
      current.rentabilidade > prev.rentabilidade ? current : prev
    );

    analise += `🏆 **Melhor desempenho:** ${melhorInvestimento.nome} (${melhorInvestimento.rentabilidade.toFixed(2)}%)\n\n`;
    analise += `💡 **Sugestão de próximo aporte:**\n\n`;
    
    if (melhorInvestimento.rentabilidade > 10) {
      analise += `Considere aportar mais em "${melhorInvestimento.nome}" que está com excelente performance.\n\n`;
    }

    analise += `📋 **Estratégia de aportes mensais:**\n`;
    analise += `• 40% em renda fixa conservadora\n`;
    analise += `• 30% em ativos de maior rentabilidade\n`;
    analise += `• 20% em diversificação (novos ativos)\n`;
    analise += `• 10% para oportunidades pontuais\n`;

    return analise;
  }

  private static analisarRisco(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.investimentos || snapshot.investimentos.length === 0) {
      return 'Você não possui investimentos para analisar risco.';
    }

    let analise = `⚡ **Análise de Risco**\n\n`;

    // Classificação simples de risco por tipo
    const riscos = {
      'tesouro_direto': 'baixo',
      'cdb': 'baixo',
      'lci': 'baixo',
      'lca': 'baixo',
      'acoes': 'alto',
      'fundos': 'medio',
      'previdencia': 'medio'
    };

    const porRisco = {
      baixo: 0,
      medio: 0,
      alto: 0
    };

    snapshot.investimentos.forEach(inv => {
      const tipo = inv.tipo.toLowerCase().replace(/\s/g, '_');
      const risco = riscos[tipo as keyof typeof riscos] || 'medio';
      porRisco[risco as keyof typeof porRisco] += inv.valor_atual;
    });

    const total = snapshot.investimentos.reduce((acc, inv) => acc + inv.valor_atual, 0);

    analise += `📊 **Distribuição por Risco:**\n\n`;
    analise += `🟢 Baixo risco: R$ ${porRisco.baixo.toFixed(2)} (${((porRisco.baixo / total) * 100).toFixed(1)}%)\n`;
    analise += `🟡 Médio risco: R$ ${porRisco.medio.toFixed(2)} (${((porRisco.medio / total) * 100).toFixed(1)}%)\n`;
    analise += `🔴 Alto risco: R$ ${porRisco.alto.toFixed(2)} (${((porRisco.alto / total) * 100).toFixed(1)}%)\n\n`;

    const percentualAltoRisco = (porRisco.alto / total) * 100;

    if (percentualAltoRisco > 50) {
      analise += `⚠️ **Alerta:** ${percentualAltoRisco.toFixed(1)}% da sua carteira está em ativos de alto risco. `;
      analise += `Considere rebalancear para reduzir volatilidade.`;
    } else if (percentualAltoRisco < 20 && porRisco.baixo / total > 0.8) {
      analise += `ℹ️ Sua carteira é muito conservadora. Se seu perfil permitir, considere diversificar com ativos de maior retorno.`;
    } else {
      analise += `✅ Sua distribuição de risco está equilibrada!`;
    }

    return analise;
  }

  private static analiseGeral(snapshot?: OpenFinanceSnapshot): string {
    let analise = `📊 **Agente de Investimentos**\n\n`;
    analise += `Posso ajudá-lo com:\n\n`;
    analise += `• 📈 Análise de rentabilidade\n`;
    analise += `• ⚖️ Rebalanceamento de carteira\n`;
    analise += `• 💧 Análise de liquidez\n`;
    analise += `• 💰 Sugestões de aportes\n`;
    analise += `• ⚡ Análise de risco\n`;
    analise += `• 🎯 Estratégias de diversificação\n\n`;
    analise += `Faça uma pergunta sobre seus investimentos!`;

    return analise;
  }
}

