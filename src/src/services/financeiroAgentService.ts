import { MensagemChat, OperacaoCredito, Cartao, OpenFinanceSnapshot } from '../types';

export class FinanceiroAgentService {
  static async chat(mensagens: MensagemChat[], snapshot?: OpenFinanceSnapshot): Promise<string> {
    const ultimaMensagem = mensagens[mensagens.length - 1];
    
    if (!ultimaMensagem || ultimaMensagem.role !== 'user') {
      return 'Como posso ajudar com suas operações financeiras?';
    }

    const pergunta = ultimaMensagem.content.toLowerCase();

    // Análises específicas
    if (pergunta.includes('financiamento') || pergunta.includes('empréstimo')) {
      return this.analisarOperacoesCredito(snapshot);
    }

    if (pergunta.includes('cartão') || pergunta.includes('cartao') || pergunta.includes('fatura')) {
      return this.analisarCartoes(snapshot);
    }

    if (pergunta.includes('amortiza') || pergunta.includes('antecipa')) {
      return this.simularAmortizacao(snapshot);
    }

    if (pergunta.includes('juros') || pergunta.includes('taxa')) {
      return this.analisarTaxas(snapshot);
    }

    // Análise geral
    return this.analiseGeral(snapshot);
  }

  private static analisarOperacoesCredito(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.operacoes_credito || snapshot.operacoes_credito.length === 0) {
      return '✅ Você não possui operações de crédito ativas no momento.';
    }

    let analise = `💳 **Análise de Operações de Crédito**\n\n`;

    const totalDevedor = snapshot.operacoes_credito.reduce((acc, op) => acc + op.saldo_devedor, 0);
    const totalOriginal = snapshot.operacoes_credito.reduce((acc, op) => acc + op.valor_original, 0);
    const percentualPago = ((totalOriginal - totalDevedor) / totalOriginal) * 100;

    analise += `📊 **Resumo Geral:**\n`;
    analise += `• Total original: R$ ${totalOriginal.toFixed(2)}\n`;
    analise += `• Saldo devedor: R$ ${totalDevedor.toFixed(2)}\n`;
    analise += `• Percentual pago: ${percentualPago.toFixed(1)}%\n\n`;

    analise += `📋 **Operações Ativas:**\n\n`;

    snapshot.operacoes_credito.forEach((op, idx) => {
      analise += `**${idx + 1}. ${op.descricao}**\n`;
      analise += `• Tipo: ${op.tipo}\n`;
      analise += `• Saldo devedor: R$ ${op.saldo_devedor.toFixed(2)}\n`;
      analise += `• Taxa de juros: ${op.taxa_juros}% a.m.\n`;
      
      if (op.total_parcelas) {
        analise += `• Parcelas: ${op.parcela_atual}/${op.total_parcelas}\n`;
        analise += `• Valor da parcela: R$ ${op.valor_parcela?.toFixed(2)}\n`;
        const faltam = op.total_parcelas - op.parcela_atual;
        analise += `• Faltam: ${faltam} parcelas (R$ ${(faltam * (op.valor_parcela || 0)).toFixed(2)})\n`;
      }
      
      analise += `\n`;
    });

    // Recomendações
    const opMaisCara = snapshot.operacoes_credito.reduce((prev, current) => 
      current.taxa_juros > prev.taxa_juros ? current : prev
    );

    analise += `💡 **Recomendação:**\n`;
    analise += `Priorize a quitação de "${opMaisCara.descricao}" que possui a maior taxa de juros (${opMaisCara.taxa_juros}% a.m.).\n`;

    return analise;
  }

  private static analisarCartoes(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.cartoes || snapshot.cartoes.length === 0) {
      return 'ℹ️ Nenhum cartão encontrado.';
    }

    let analise = `💳 **Análise de Cartões**\n\n`;

    const limiteTotal = snapshot.cartoes.reduce((acc, c) => acc + c.limite, 0);
    const disponivelTotal = snapshot.cartoes.reduce((acc, c) => acc + c.limite_disponivel, 0);
    const utilizadoTotal = limiteTotal - disponivelTotal;
    const percentualUtilizacao = (utilizadoTotal / limiteTotal) * 100;

    analise += `📊 **Resumo:**\n`;
    analise += `• Limite total: R$ ${limiteTotal.toFixed(2)}\n`;
    analise += `• Disponível: R$ ${disponivelTotal.toFixed(2)}\n`;
    analise += `• Utilizado: R$ ${utilizadoTotal.toFixed(2)} (${percentualUtilizacao.toFixed(1)}%)\n\n`;

    if (percentualUtilizacao > 80) {
      analise += `⚠️ **Alerta:** Você está usando ${percentualUtilizacao.toFixed(1)}% do seu limite total. `;
      analise += `Recomendo manter abaixo de 30% para um score de crédito saudável.\n\n`;
    }

    analise += `💳 **Cartões:**\n\n`;

    snapshot.cartoes.forEach((cartao, idx) => {
      const utilizado = cartao.limite - cartao.limite_disponivel;
      const percUtil = (utilizado / cartao.limite) * 100;

      analise += `**${idx + 1}. Cartão ${cartao.bandeira} •••• ${cartao.numero_final}**\n`;
      analise += `• Limite: R$ ${cartao.limite.toFixed(2)}\n`;
      analise += `• Disponível: R$ ${cartao.limite_disponivel.toFixed(2)}\n`;
      analise += `• Utilização: ${percUtil.toFixed(1)}%\n`;
      analise += `• Vencimento: dia ${cartao.dia_vencimento}\n`;
      analise += `• Fechamento: dia ${cartao.dia_fechamento}\n\n`;
    });

    return analise;
  }

  private static simularAmortizacao(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.operacoes_credito || snapshot.operacoes_credito.length === 0) {
      return 'Você não possui operações de crédito para simular amortização.';
    }

    const operacao = snapshot.operacoes_credito[0]; // Pega a primeira
    const valorAmortizar = operacao.valor_parcela ? operacao.valor_parcela * 2 : 1000;

    let analise = `💰 **Simulação de Amortização**\n\n`;
    analise += `**Operação:** ${operacao.descricao}\n`;
    analise += `**Saldo atual:** R$ ${operacao.saldo_devedor.toFixed(2)}\n\n`;

    // Simulação simples
    const novoSaldo = operacao.saldo_devedor - valorAmortizar;
    const jurosMensaisAtual = operacao.saldo_devedor * (operacao.taxa_juros / 100);
    const jurosMensaisNovo = novoSaldo * (operacao.taxa_juros / 100);
    const economiaMensal = jurosMensaisAtual - jurosMensaisNovo;

    analise += `Se você amortizar R$ ${valorAmortizar.toFixed(2)}:\n\n`;
    analise += `✅ Novo saldo: R$ ${novoSaldo.toFixed(2)}\n`;
    analise += `💵 Economia mensal em juros: R$ ${economiaMensal.toFixed(2)}\n`;
    analise += `📅 Economia em 12 meses: R$ ${(economiaMensal * 12).toFixed(2)}\n\n`;

    analise += `💡 **Recomendação:** Sempre que possível, amortize as dívidas com maiores taxas de juros primeiro!`;

    return analise;
  }

  private static analisarTaxas(snapshot?: OpenFinanceSnapshot): string {
    if (!snapshot?.operacoes_credito || snapshot.operacoes_credito.length === 0) {
      return 'Você não possui operações com taxas de juros no momento.';
    }

    let analise = `📊 **Análise de Taxas de Juros**\n\n`;

    const taxas = snapshot.operacoes_credito.map(op => ({
      descricao: op.descricao,
      taxa: op.taxa_juros,
      saldo: op.saldo_devedor
    })).sort((a, b) => b.taxa - a.taxa);

    analise += `🔴 **Do maior para o menor:**\n\n`;

    taxas.forEach((item, idx) => {
      const jurosMensal = item.saldo * (item.taxa / 100);
      const jurosAnual = jurosMensal * 12;

      analise += `${idx + 1}. **${item.descricao}**\n`;
      analise += `   Taxa: ${item.taxa}% a.m.\n`;
      analise += `   Juros mensal: R$ ${jurosMensal.toFixed(2)}\n`;
      analise += `   Projeção anual de juros: R$ ${jurosAnual.toFixed(2)}\n\n`;
    });

    const totalJurosAnual = taxas.reduce((acc, t) => {
      return acc + (t.saldo * (t.taxa / 100) * 12);
    }, 0);

    analise += `⚠️ **Total projetado em juros (12 meses):** R$ ${totalJurosAnual.toFixed(2)}\n\n`;
    analise += `💡 Priorize quitar as dívidas com taxas mais altas para economizar!`;

    return analise;
  }

  private static analiseGeral(snapshot?: OpenFinanceSnapshot): string {
    let analise = `🏦 **Agente Financeiro**\n\n`;
    analise += `Posso ajudá-lo com:\n\n`;
    analise += `• 📊 Análise de operações de crédito\n`;
    analise += `• 💳 Gestão de cartões e faturas\n`;
    analise += `• 💰 Simulações de amortização\n`;
    analise += `• 📈 Análise de taxas de juros\n`;
    analise += `• 💡 Recomendações personalizadas\n\n`;
    analise += `Faça uma pergunta sobre suas operações financeiras!`;

    return analise;
  }
}

