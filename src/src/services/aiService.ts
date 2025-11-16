import { PlanilhaData, MensagemChat } from '../types';

export class AIService {
  static async chat(mensagens: MensagemChat[], contexto: PlanilhaData): Promise<string> {
    // Simulação de IA - em produção, integraria com API real (OpenAI, Claude, etc)
    const ultimaMensagem = mensagens[mensagens.length - 1];
    
    if (!ultimaMensagem || ultimaMensagem.role !== 'user') {
      return 'Por favor, faça uma pergunta sobre seu fluxo de caixa.';
    }

    const pergunta = ultimaMensagem.content.toLowerCase();

    // Análise básica baseada em palavras-chave
    if (pergunta.includes('saldo') || pergunta.includes('total')) {
      return this.analisarSaldo(contexto);
    }

    if (pergunta.includes('despesa') || pergunta.includes('gasto')) {
      return this.analisarDespesas(contexto);
    }

    if (pergunta.includes('receita') || pergunta.includes('entrada')) {
      return this.analisarReceitas(contexto);
    }

    if (pergunta.includes('categoria')) {
      return this.analisarCategorias(contexto);
    }

    if (pergunta.includes('mês') || pergunta.includes('mes')) {
      return this.analisarMensal(contexto);
    }

    // Resposta padrão
    return `Entendi sua pergunta sobre "${ultimaMensagem.content}". 
    
Com base nos seus dados:
- Total de entradas: ${contexto.entradas.length}
- Receitas totais: R$ ${this.calcularTotalReceitas(contexto).toFixed(2)}
- Despesas totais: R$ ${this.calcularTotalDespesas(contexto).toFixed(2)}
- Saldo: R$ ${(this.calcularTotalReceitas(contexto) - this.calcularTotalDespesas(contexto)).toFixed(2)}

Como posso ajudar mais especificamente?`;
  }

  private static calcularTotalReceitas(contexto: PlanilhaData): number {
    return contexto.entradas
      .filter(e => e.tipo === 'receita')
      .reduce((acc, e) => acc + e.valor, 0);
  }

  private static calcularTotalDespesas(contexto: PlanilhaData): number {
    return contexto.entradas
      .filter(e => e.tipo === 'despesa')
      .reduce((acc, e) => acc + e.valor, 0);
  }

  private static analisarSaldo(contexto: PlanilhaData): string {
    const receitas = this.calcularTotalReceitas(contexto);
    const despesas = this.calcularTotalDespesas(contexto);
    const saldo = receitas - despesas;

    let analise = `📊 **Análise de Saldo**\n\n`;
    analise += `💰 Receitas totais: R$ ${receitas.toFixed(2)}\n`;
    analise += `💸 Despesas totais: R$ ${despesas.toFixed(2)}\n`;
    analise += `${saldo >= 0 ? '✅' : '⚠️'} Saldo: R$ ${saldo.toFixed(2)}\n\n`;

    if (saldo < 0) {
      analise += `⚠️ **Atenção**: Suas despesas estão superando as receitas em R$ ${Math.abs(saldo).toFixed(2)}. `;
      analise += `Considere revisar seus gastos ou buscar formas de aumentar sua renda.`;
    } else {
      const percentualEconomia = (saldo / receitas) * 100;
      analise += `✨ Você está economizando ${percentualEconomia.toFixed(1)}% da sua renda. `;
      if (percentualEconomia < 10) {
        analise += `Recomendo tentar aumentar essa taxa para pelo menos 20%.`;
      } else {
        analise += `Parabéns! Continue assim!`;
      }
    }

    return analise;
  }

  private static analisarDespesas(contexto: PlanilhaData): string {
    const despesas = contexto.entradas.filter(e => e.tipo === 'despesa');
    const total = despesas.reduce((acc, e) => acc + e.valor, 0);

    const porCategoria = new Map<string, number>();
    despesas.forEach(d => {
      porCategoria.set(d.categoria, (porCategoria.get(d.categoria) || 0) + d.valor);
    });

    let analise = `💸 **Análise de Despesas**\n\n`;
    analise += `Total de despesas: R$ ${total.toFixed(2)}\n`;
    analise += `Número de lançamentos: ${despesas.length}\n\n`;
    analise += `📊 **Por categoria:**\n`;

    Array.from(porCategoria.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([cat, valor]) => {
        const percentual = (valor / total) * 100;
        analise += `• ${cat}: R$ ${valor.toFixed(2)} (${percentual.toFixed(1)}%)\n`;
      });

    return analise;
  }

  private static analisarReceitas(contexto: PlanilhaData): string {
    const receitas = contexto.entradas.filter(e => e.tipo === 'receita');
    const total = receitas.reduce((acc, e) => acc + e.valor, 0);

    let analise = `💰 **Análise de Receitas**\n\n`;
    analise += `Total de receitas: R$ ${total.toFixed(2)}\n`;
    analise += `Número de lançamentos: ${receitas.length}\n\n`;

    if (receitas.length > 0) {
      const media = total / receitas.length;
      analise += `Média por lançamento: R$ ${media.toFixed(2)}\n`;
    }

    return analise;
  }

  private static analisarCategorias(contexto: PlanilhaData): string {
    const categorias = new Map<string, { total: number; quantidade: number }>();

    contexto.entradas.forEach(e => {
      if (!categorias.has(e.categoria)) {
        categorias.set(e.categoria, { total: 0, quantidade: 0 });
      }
      const cat = categorias.get(e.categoria)!;
      cat.total += e.tipo === 'receita' ? e.valor : -e.valor;
      cat.quantidade += 1;
    });

    let analise = `📁 **Análise por Categorias**\n\n`;

    Array.from(categorias.entries())
      .sort((a, b) => Math.abs(b[1].total) - Math.abs(a[1].total))
      .forEach(([cat, dados]) => {
        const sinal = dados.total >= 0 ? '+' : '';
        analise += `• ${cat}: ${sinal}R$ ${dados.total.toFixed(2)} (${dados.quantidade} lançamentos)\n`;
      });

    return analise;
  }

  private static analisarMensal(contexto: PlanilhaData): string {
    const porMes = new Map<string, { receitas: number; despesas: number }>();

    contexto.entradas.forEach(e => {
      const mes = e.data.substring(0, 7);
      if (!porMes.has(mes)) {
        porMes.set(mes, { receitas: 0, despesas: 0 });
      }
      const dados = porMes.get(mes)!;
      if (e.tipo === 'receita') {
        dados.receitas += e.valor;
      } else {
        dados.despesas += e.valor;
      }
    });

    let analise = `📅 **Análise Mensal**\n\n`;

    Array.from(porMes.entries())
      .sort()
      .slice(-6) // Últimos 6 meses
      .forEach(([mes, dados]) => {
        const saldo = dados.receitas - dados.despesas;
        const [ano, mesNum] = mes.split('-');
        const mesNome = new Date(`${ano}-${mesNum}-01`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        analise += `📆 **${mesNome}**\n`;
        analise += `  Receitas: R$ ${dados.receitas.toFixed(2)}\n`;
        analise += `  Despesas: R$ ${dados.despesas.toFixed(2)}\n`;
        analise += `  Saldo: R$ ${saldo.toFixed(2)}\n\n`;
      });

    return analise;
  }
}

