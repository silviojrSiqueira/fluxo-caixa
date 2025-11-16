import { PlanilhaData, RegraIA, ProjecaoConfig } from '../types';

const STORAGE_KEYS = {
  PLANILHA: 'fluxo_caixa_planilha',
  REGRAS_IA: 'fluxo_caixa_regras_ia',
  PROJECOES: 'fluxo_caixa_projecoes'
};

export class StorageService {
  static salvarPlanilha(data: PlanilhaData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANILHA, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar planilha:', error);
      throw new Error('Falha ao salvar dados localmente');
    }
  }

  static carregarPlanilha(): PlanilhaData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANILHA);
      if (data) {
        return JSON.parse(data);
      }
      return {
        entradas: [],
        categorias: [
          'Salário',
          'Freelance',
          'Investimentos',
          'Alimentação',
          'Transporte',
          'Moradia',
          'Lazer',
          'Saúde',
          'Educação',
          'Outros'
        ],
        contas: ['Conta Corrente', 'Poupança', 'Carteira']
      };
    } catch (error) {
      console.error('Erro ao carregar planilha:', error);
      return {
        entradas: [],
        categorias: [],
        contas: []
      };
    }
  }

  static salvarRegrasIA(regras: RegraIA[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REGRAS_IA, JSON.stringify(regras));
    } catch (error) {
      console.error('Erro ao salvar regras IA:', error);
      throw new Error('Falha ao salvar regras');
    }
  }

  static carregarRegrasIA(): RegraIA[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGRAS_IA);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar regras IA:', error);
      return [];
    }
  }

  static salvarProjecoes(config: ProjecaoConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECOES, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configurações de projeção:', error);
    }
  }

  static carregarProjecoes(): ProjecaoConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECOES);
      if (data) {
        return JSON.parse(data);
      }
      return {
        meses: 12,
        incluirCartoes: true,
        incluirDespesasGerais: true,
        taxaCrescimento: 0
      };
    } catch (error) {
      console.error('Erro ao carregar configurações de projeção:', error);
      return {
        meses: 12,
        incluirCartoes: true,
        incluirDespesasGerais: true
      };
    }
  }

  static exportarBackup(): string {
    const backup = {
      planilha: this.carregarPlanilha(),
      regras: this.carregarRegrasIA(),
      projecoes: this.carregarProjecoes(),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importarBackup(jsonString: string): void {
    try {
      const backup = JSON.parse(jsonString);

      if (backup.planilha) {
        this.salvarPlanilha(backup.planilha);
      }
      if (backup.regras) {
        this.salvarRegrasIA(backup.regras);
      }
      if (backup.projecoes) {
        this.salvarProjecoes(backup.projecoes);
      }
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      throw new Error('Formato de backup inválido');
    }
  }

  static limparTodosDados(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

