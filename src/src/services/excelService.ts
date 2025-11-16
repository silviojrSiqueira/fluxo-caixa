import ExcelJS from 'exceljs';
import { PlanilhaData, ProjecaoConfig, DadosFluxoMensal } from '../types';

export class ExcelService {
  static gerarFluxoMensal(planilha: PlanilhaData): DadosFluxoMensal[] {
    const fluxoPorMes = new Map<string, { receitas: number; despesas: number }>();

    planilha.entradas.forEach(entrada => {
      const mesAno = entrada.data.substring(0, 7); // YYYY-MM
      
      if (!fluxoPorMes.has(mesAno)) {
        fluxoPorMes.set(mesAno, { receitas: 0, despesas: 0 });
      }

      const dados = fluxoPorMes.get(mesAno)!;
      if (entrada.tipo === 'receita') {
        dados.receitas += entrada.valor;
      } else {
        dados.despesas += entrada.valor;
      }
    });

    const resultado: DadosFluxoMensal[] = [];
    const mesesOrdenados = Array.from(fluxoPorMes.keys()).sort();

    mesesOrdenados.forEach(mes => {
      const dados = fluxoPorMes.get(mes)!;
      resultado.push({
        mes,
        receitas: dados.receitas,
        despesas: dados.despesas,
        saldo: dados.receitas - dados.despesas
      });
    });

    return resultado;
  }

  static projetarFluxoFuturo(
    fluxoAtual: DadosFluxoMensal[],
    config: ProjecaoConfig
  ): DadosFluxoMensal[] {
    if (fluxoAtual.length === 0) {
      return [];
    }

    const ultimoMes = fluxoAtual[fluxoAtual.length - 1];
    const mediaReceitas = fluxoAtual.reduce((acc, f) => acc + f.receitas, 0) / fluxoAtual.length;
    const mediaDespesas = fluxoAtual.reduce((acc, f) => acc + f.despesas, 0) / fluxoAtual.length;

    const projecoes: DadosFluxoMensal[] = [];
    let dataBase = new Date(ultimoMes.mes + '-01');

    for (let i = 1; i <= config.meses; i++) {
      dataBase.setMonth(dataBase.getMonth() + 1);
      const mesAno = dataBase.toISOString().substring(0, 7);

      const fatorCrescimento = 1 + (config.taxaCrescimento || 0) / 100;
      
      projecoes.push({
        mes: mesAno,
        receitas: mediaReceitas * fatorCrescimento,
        despesas: mediaDespesas * fatorCrescimento,
        saldo: (mediaReceitas - mediaDespesas) * fatorCrescimento
      });
    }

    return projecoes;
  }

  static async exportarParaExcel(
    planilha: PlanilhaData,
    config: ProjecaoConfig
  ): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fluxo de Caixa';
    workbook.created = new Date();

    // Aba 1: Entradas
    const wsEntradas = workbook.addWorksheet('Entradas');
    wsEntradas.columns = [
      { header: 'Data', key: 'data', width: 12 },
      { header: 'Tipo', key: 'tipo', width: 10 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 },
      { header: 'Conta', key: 'conta', width: 20 },
      { header: 'Origem', key: 'origem', width: 15 }
    ];

    planilha.entradas.forEach(entrada => {
      wsEntradas.addRow({
        data: entrada.data,
        tipo: entrada.tipo,
        categoria: entrada.categoria,
        descricao: entrada.descricao,
        valor: entrada.valor,
        conta: entrada.conta || '',
        origem: entrada.origem || 'manual'
      });
    });

    // Formata cabeçalho
    wsEntradas.getRow(1).font = { bold: true };
    wsEntradas.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Aba 2: Fluxo Mensal
    const fluxoMensal = this.gerarFluxoMensal(planilha);
    const wsFluxo = workbook.addWorksheet('Fluxo Mensal');
    wsFluxo.columns = [
      { header: 'Mês', key: 'mes', width: 12 },
      { header: 'Receitas', key: 'receitas', width: 15 },
      { header: 'Despesas', key: 'despesas', width: 15 },
      { header: 'Saldo', key: 'saldo', width: 15 }
    ];

    fluxoMensal.forEach(dados => {
      wsFluxo.addRow(dados);
    });

    // Aba 3: Projeções
    if (config.incluirCartoes || config.incluirDespesasGerais) {
      const projecoes = this.projetarFluxoFuturo(fluxoMensal, config);
      const wsProjecoes = workbook.addWorksheet('Projeções');
      wsProjecoes.columns = [
        { header: 'Mês', key: 'mes', width: 12 },
        { header: 'Receitas Previstas', key: 'receitas', width: 18 },
        { header: 'Despesas Previstas', key: 'despesas', width: 18 },
        { header: 'Saldo Previsto', key: 'saldo', width: 15 },
        { header: 'Tipo', key: 'tipo', width: 10 }
      ];

      projecoes.forEach(dados => {
        wsProjecoes.addRow({
          ...dados,
          tipo: 'PREVISTO'
        });
      });

      // Destaca valores previstos
      wsProjecoes.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.getCell('tipo').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC000' }
          };
        }
      });
    }

    // Aba 4: Resumo por Categoria
    const wsResumo = workbook.addWorksheet('Resumo por Categoria');
    wsResumo.columns = [
      { header: 'Categoria', key: 'categoria', width: 25 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Quantidade', key: 'quantidade', width: 12 }
    ];

    const resumoPorCategoria = new Map<string, { total: number; quantidade: number }>();
    planilha.entradas.forEach(entrada => {
      if (!resumoPorCategoria.has(entrada.categoria)) {
        resumoPorCategoria.set(entrada.categoria, { total: 0, quantidade: 0 });
      }
      const dados = resumoPorCategoria.get(entrada.categoria)!;
      dados.total += entrada.valor;
      dados.quantidade += 1;
    });

    resumoPorCategoria.forEach((dados, categoria) => {
      wsResumo.addRow({
        categoria,
        total: dados.total,
        quantidade: dados.quantidade
      });
    });

    // Formata todos os cabeçalhos
    workbook.worksheets.forEach(ws => {
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
    });

    // Gera o arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  static baixarExcel(blob: Blob, nomeArquivo: string = 'fluxo-caixa.xlsx'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

