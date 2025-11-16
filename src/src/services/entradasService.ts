import { Entrada } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export class EntradasService {
  /**
   * Busca todas as entradas manuais do banco de dados
   */
  static async buscarEntradas(): Promise<Entrada[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/entradas_manuais`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const entradas = await response.json();
      
      // Converte o formato do banco para o formato da aplicação
      return entradas.map((e: any) => ({
        id: e.id,
        tipo: e.tipo,
        categoria: e.categoria,
        descricao: e.descricao,
        valor: parseFloat(e.valor) || 0, // Garante que seja número
        data: e.data,
        conta: e.conta,
        recorrente: Boolean(e.recorrente),
        frequencia: e.frequencia,
        origem: e.origem || 'manual'
      }));
    } catch (error) {
      console.error('Erro ao buscar entradas:', error);
      // Em caso de erro, retorna array vazio (fallback para localStorage)
      return [];
    }
  }

  /**
   * Cria uma nova entrada no banco de dados
   */
  static async criarEntrada(entrada: Entrada): Promise<void> {
    try {
      const payload = {
        id: entrada.id,
        tipo: entrada.tipo,
        categoria: entrada.categoria,
        descricao: entrada.descricao,
        valor: entrada.valor,
        data: entrada.data,
        conta: entrada.conta || null,
        recorrente: entrada.recorrente ? 1 : 0,
        frequencia: entrada.frequencia || null,
        origem: 'manual'
      };

      const response = await fetch(`${API_BASE_URL}/entradas_manuais`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar entrada');
      }
    } catch (error) {
      console.error('Erro ao criar entrada:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma entrada existente
   */
  static async atualizarEntrada(entrada: Entrada): Promise<void> {
    try {
      const payload = {
        tipo: entrada.tipo,
        categoria: entrada.categoria,
        descricao: entrada.descricao,
        valor: entrada.valor,
        data: entrada.data,
        conta: entrada.conta || null,
        recorrente: entrada.recorrente ? 1 : 0,
        frequencia: entrada.frequencia || null
      };

      const response = await fetch(`${API_BASE_URL}/entradas_manuais/${entrada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar entrada');
      }
    } catch (error) {
      console.error('Erro ao atualizar entrada:', error);
      throw error;
    }
  }

  /**
   * Remove uma entrada do banco de dados
   */
  static async removerEntrada(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/entradas_manuais/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover entrada');
      }
    } catch (error) {
      console.error('Erro ao remover entrada:', error);
      throw error;
    }
  }

  /**
   * Migra entradas do localStorage para o banco de dados
   */
  static async migrarDoLocalStorage(entradas: Entrada[]): Promise<number> {
    let migradas = 0;
    
    for (const entrada of entradas) {
      try {
        await this.criarEntrada(entrada);
        migradas++;
      } catch (error) {
        console.error(`Erro ao migrar entrada ${entrada.id}:`, error);
      }
    }
    
    return migradas;
  }

  /**
   * Sincroniza entradas: tenta buscar do banco, se falhar usa localStorage
   */
  static async sincronizarEntradas(entradasLocal: Entrada[]): Promise<{
    entradas: Entrada[];
    fonte: 'database' | 'localStorage';
  }> {
    try {
      // Tenta buscar do banco
      const entradasDB = await this.buscarEntradas();
      
      if (entradasDB.length > 0) {
        return { entradas: entradasDB, fonte: 'database' };
      }
      
      // Se banco está vazio mas há entradas no localStorage, migra
      if (entradasLocal.length > 0) {
        console.log('Migrando entradas do localStorage para o banco...');
        await this.migrarDoLocalStorage(entradasLocal);
        const entradasMigradas = await this.buscarEntradas();
        return { entradas: entradasMigradas, fonte: 'database' };
      }
      
      return { entradas: [], fonte: 'database' };
    } catch (error) {
      console.error('Erro ao sincronizar, usando localStorage:', error);
      return { entradas: entradasLocal, fonte: 'localStorage' };
    }
  }
}

