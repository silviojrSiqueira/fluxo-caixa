import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PlanilhaData, Entrada, OpenFinanceSnapshot, RegraIA, ProjecaoConfig } from './types';
import { StorageService } from './services/storageService';
import { OpenFinanceService } from './services/openFinanceService';
import { ExcelService } from './services/excelService';
import { AgentRulesService } from './services/agentRulesService';
import { EntradasService } from './services/entradasService';
import { AIChat } from './components/AIChat';
import { FinanceiroAgentChat } from './components/FinanceiroAgentChat';
import { InvestimentoAgentChat } from './components/InvestimentoAgentChat';
import { AgentRulesManager } from './components/AgentRulesManager';
import { MobilePreview } from './components/MobilePreview';
import './App.css';

function App() {
  const [planilhaData, setPlanilhaData] = useState<PlanilhaData>(StorageService.carregarPlanilha());
  const [planilhaIntegrada, setPlanilhaIntegrada] = useState<PlanilhaData>(planilhaData);
  const [snapshot, setSnapshot] = useState<OpenFinanceSnapshot | undefined>();
  const [regrasIA, setRegrasIA] = useState<RegraIA[]>(StorageService.carregarRegrasIA());
  const [projecoes, setProjecoes] = useState<ProjecaoConfig>(StorageService.carregarProjecoes());

  const [abaAtiva, setAbaAtiva] = useState<'entradas' | 'consolidado' | 'backup' | 'openfinance' | 'regras'>('entradas');
  const [modalAberto, setModalAberto] = useState<'ai' | 'financeiro' | 'investimento' | 'regras' | null>(null);

  const [novaEntrada, setNovaEntrada] = useState<Partial<Entrada>>({
    tipo: 'despesa',
    categoria: '',
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0]
  });

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [fonteEntradas, setFonteEntradas] = useState<'database' | 'localStorage'>('localStorage');

  // Carrega entradas do banco de dados na inicialização
  useEffect(() => {
    const carregarEntradasDB = async () => {
      const entradasLocal = StorageService.carregarPlanilha();
      const { entradas, fonte } = await EntradasService.sincronizarEntradas(entradasLocal.entradas);

      setFonteEntradas(fonte);
      setPlanilhaData(prev => ({
        ...prev,
        entradas
      }));
      setPlanilhaIntegrada(prev => ({
        ...prev,
        entradas
      }));

      if (fonte === 'database') {
        console.log('✅ Entradas carregadas do banco de dados');
      } else {
        console.log('⚠️ Usando localStorage (banco indisponível)');
      }
    };

    carregarEntradasDB();
  }, []);

  // Salva automaticamente no localStorage como backup
  useEffect(() => {
    StorageService.salvarPlanilha(planilhaData);
  }, [planilhaData]);

  useEffect(() => {
    StorageService.salvarRegrasIA(regrasIA);
  }, [regrasIA]);

  useEffect(() => {
    StorageService.salvarProjecoes(projecoes);
  }, [projecoes]);

  // Avalia regras IA quando dados mudam
  useEffect(() => {
    const avaliacoes = AgentRulesService.avaliarRegras(regrasIA, planilhaIntegrada, snapshot);
    avaliacoes.forEach(av => {
      if (av.ativada) {
        mostrarMensagem('sucesso', av.mensagem);
      }
    });
  }, [planilhaIntegrada, snapshot]);

  const mostrarMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  const adicionarEntrada = async () => {
    if (!novaEntrada.categoria || !novaEntrada.descricao || !novaEntrada.valor) {
      mostrarMensagem('erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const entrada: Entrada = {
      id: `entrada-${Date.now()}`,
      tipo: novaEntrada.tipo!,
      categoria: novaEntrada.categoria,
      descricao: novaEntrada.descricao,
      valor: novaEntrada.valor,
      data: novaEntrada.data!,
      conta: novaEntrada.conta,
      recorrente: novaEntrada.recorrente,
      frequencia: novaEntrada.frequencia,
      origem: 'manual'
    };

    // Adiciona localmente primeiro (para melhor UX)
    setPlanilhaData(prev => ({
      ...prev,
      entradas: [...prev.entradas, entrada]
    }));

    setPlanilhaIntegrada(prev => ({
      ...prev,
      entradas: [...prev.entradas, entrada]
    }));

    setNovaEntrada({
      tipo: 'despesa',
      categoria: '',
      descricao: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0]
    });

    // Tenta salvar no banco de dados
    try {
      await EntradasService.criarEntrada(entrada);
      setFonteEntradas('database');
      mostrarMensagem('sucesso', '✅ Entrada salva no banco de dados!');
    } catch (error) {
      console.error('Erro ao salvar no banco, usando localStorage:', error);
      mostrarMensagem('sucesso', '⚠️ Entrada salva localmente (banco indisponível)');
    }
  };

  const removerEntrada = async (id: string) => {
    // Remove localmente primeiro (para melhor UX)
    setPlanilhaData(prev => ({
      ...prev,
      entradas: prev.entradas.filter(e => e.id !== id)
    }));

    setPlanilhaIntegrada(prev => ({
      ...prev,
      entradas: prev.entradas.filter(e => e.id !== id)
    }));

    // Tenta remover do banco de dados
    try {
      await EntradasService.removerEntrada(id);
      mostrarMensagem('sucesso', '✅ Entrada removida do banco de dados!');
    } catch (error) {
      console.error('Erro ao remover do banco:', error);
      mostrarMensagem('sucesso', '⚠️ Entrada removida localmente (banco indisponível)');
    }
  };

  const atualizarOpenFinance = async () => {
    setCarregando(true);
    try {
      const novoSnapshot = await OpenFinanceService.buscarSnapshot();
      setSnapshot(novoSnapshot);

      const planilhaIntegradaTemp = OpenFinanceService.integrarPlanilhaComOpenFinance(
        planilhaData,
        novoSnapshot
      );

      setPlanilhaIntegrada(planilhaIntegradaTemp);
      mostrarMensagem('sucesso', 'Dados Open Finance atualizados!');
    } catch (error) {
      console.error('Erro ao atualizar Open Finance:', error);
      mostrarMensagem('erro', 'Erro ao conectar com Open Finance. Verifique se o servidor está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  const exportarExcel = async () => {
    setCarregando(true);
    try {
      const blob = await ExcelService.exportarParaExcel(planilhaIntegrada, projecoes);
      ExcelService.baixarExcel(blob, `fluxo-caixa-${new Date().toISOString().split('T')[0]}.xlsx`);
      mostrarMensagem('sucesso', 'Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      mostrarMensagem('erro', 'Erro ao exportar Excel');
    } finally {
      setCarregando(false);
    }
  };

  const exportarBackup = () => {
    const backup = StorageService.exportarBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-fluxo-caixa-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    mostrarMensagem('sucesso', 'Backup exportado com sucesso!');
  };

  const importarBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        StorageService.importarBackup(conteudo);

        // Recarrega os dados
        const novaPlanilha = StorageService.carregarPlanilha();
        setPlanilhaData(novaPlanilha);
        setPlanilhaIntegrada(novaPlanilha);
        setRegrasIA(StorageService.carregarRegrasIA());
        setProjecoes(StorageService.carregarProjecoes());

        mostrarMensagem('sucesso', 'Backup restaurado com sucesso!');
      } catch (error) {
        mostrarMensagem('erro', 'Erro ao importar backup');
      }
    };
    reader.readAsText(file);
  };

  const calcularResumo = () => {
    const receitas = planilhaIntegrada.entradas
      .filter(e => e.tipo === 'receita')
      .reduce((acc, e) => acc + (Number(e.valor) || 0), 0);

    const despesas = planilhaIntegrada.entradas
      .filter(e => e.tipo === 'despesa')
      .reduce((acc, e) => acc + (Number(e.valor) || 0), 0);

    return {
      receitas: Number(receitas) || 0,
      despesas: Number(despesas) || 0,
      saldo: Number(receitas - despesas) || 0
    };
  };

  const resumo = calcularResumo();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mobile-preview" element={
          <MobilePreview
            planilha={planilhaIntegrada}
            snapshot={snapshot}
            onAbrirAgente={(tipo) => setModalAberto(tipo)}
          />
        } />

        <Route path="/" element={
          <div className="app">
            <header className="app-header">
              <div>
                <h1>💰 Fluxo de Caixa</h1>
                <small style={{ opacity: 0.8, fontSize: '12px' }}>
                  {fonteEntradas === 'database' ? '🗄️ Conectado ao banco de dados' : '💾 Modo offline (localStorage)'}
                </small>
              </div>
              <div className="header-actions">
                <button onClick={() => setModalAberto('ai')} className="btn-agent">
                  💬 Chat IA
                </button>
                <button onClick={() => setModalAberto('financeiro')} className="btn-agent btn-financeiro">
                  🏦 Agente Financeiro
                </button>
                <button onClick={() => setModalAberto('investimento')} className="btn-agent btn-investimento">
                  📊 Agente Investimentos
                </button>
                <Link to="/mobile-preview" className="btn-mobile">
                  📱 Visualizar Mobile
                </Link>
              </div>
            </header>

            {mensagem && (
              <div className={`mensagem mensagem-${mensagem.tipo}`}>
                {mensagem.texto}
              </div>
            )}

            <div className="resumo-geral">
              <div className="resumo-card receitas">
                <div className="resumo-label">💰 Receitas</div>
                <div className="resumo-valor">R$ {resumo.receitas.toFixed(2)}</div>
              </div>
              <div className="resumo-card despesas">
                <div className="resumo-label">💸 Despesas</div>
                <div className="resumo-valor">R$ {resumo.despesas.toFixed(2)}</div>
              </div>
              <div className={`resumo-card saldo ${resumo.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                <div className="resumo-label">📊 Saldo</div>
                <div className="resumo-valor">R$ {resumo.saldo.toFixed(2)}</div>
              </div>
            </div>

            <div className="abas">
              <button
                className={`aba ${abaAtiva === 'entradas' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('entradas')}
              >
                📝 Entradas
              </button>
              <button
                className={`aba ${abaAtiva === 'consolidado' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('consolidado')}
              >
                📊 Consolidado
              </button>
              <button
                className={`aba ${abaAtiva === 'openfinance' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('openfinance')}
              >
                🏦 Open Finance
              </button>
              <button
                className={`aba ${abaAtiva === 'regras' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('regras')}
              >
                ⚙️ Regras IA
              </button>
              <button
                className={`aba ${abaAtiva === 'backup' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('backup')}
              >
                💾 Backup
              </button>
            </div>

            <div className="conteudo">
              {abaAtiva === 'entradas' && (
                <div className="aba-entradas">
                  <div className="formulario-entrada">
                    <h2>Nova Entrada</h2>
                    <div className="form-group">
                      <label>Tipo:</label>
                      <select
                        value={novaEntrada.tipo}
                        onChange={(e) => setNovaEntrada({ ...novaEntrada, tipo: e.target.value as any })}
                      >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Categoria:</label>
                      <input
                        type="text"
                        value={novaEntrada.categoria}
                        onChange={(e) => setNovaEntrada({ ...novaEntrada, categoria: e.target.value })}
                        list="categorias"
                      />
                      <datalist id="categorias">
                        {planilhaData.categorias.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label>Descrição:</label>
                      <input
                        type="text"
                        value={novaEntrada.descricao}
                        onChange={(e) => setNovaEntrada({ ...novaEntrada, descricao: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Valor:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={novaEntrada.valor}
                        onChange={(e) => setNovaEntrada({ ...novaEntrada, valor: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Data:</label>
                      <input
                        type="date"
                        value={novaEntrada.data}
                        onChange={(e) => setNovaEntrada({ ...novaEntrada, data: e.target.value })}
                      />
                    </div>
                    <button onClick={adicionarEntrada} className="btn-primary">
                      ➕ Adicionar
                    </button>
                  </div>

                  <div className="lista-entradas">
                    <h2>Entradas Cadastradas ({planilhaData.entradas.length})</h2>
                    {planilhaData.entradas.length === 0 ? (
                      <p className="empty-state">Nenhuma entrada cadastrada ainda.</p>
                    ) : (
                      <table className="tabela-entradas">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Categoria</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {planilhaData.entradas.map(entrada => (
                            <tr key={entrada.id}>
                              <td>{new Date(entrada.data).toLocaleDateString('pt-BR')}</td>
                              <td>
                                <span className={`badge badge-${entrada.tipo}`}>
                                  {entrada.tipo}
                                </span>
                              </td>
                              <td>{entrada.categoria}</td>
                              <td>{entrada.descricao}</td>
                              <td className={entrada.tipo === 'receita' ? 'valor-positivo' : 'valor-negativo'}>
                                R$ {entrada.valor.toFixed(2)}
                              </td>
                              <td>
                                <button
                                  onClick={() => removerEntrada(entrada.id)}
                                  className="btn-danger-small"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {abaAtiva === 'consolidado' && (
                <div className="aba-consolidado">
                  <h2>Visão Consolidada</h2>
                  <div className="acoes-consolidado">
                    <button onClick={exportarExcel} className="btn-export" disabled={carregando}>
                      {carregando ? '⏳ Exportando...' : '📥 Exportar Excel'}
                    </button>
                  </div>

                  <div className="estatisticas">
                    <h3>Por Categoria</h3>
                    <table className="tabela-resumo">
                      <thead>
                        <tr>
                          <th>Categoria</th>
                          <th>Receitas</th>
                          <th>Despesas</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(new Set(planilhaIntegrada.entradas.map(e => e.categoria))).map(cat => {
                          const receitasCat = planilhaIntegrada.entradas
                            .filter(e => e.categoria === cat && e.tipo === 'receita')
                            .reduce((acc, e) => acc + e.valor, 0);
                          const despesasCat = planilhaIntegrada.entradas
                            .filter(e => e.categoria === cat && e.tipo === 'despesa')
                            .reduce((acc, e) => acc + e.valor, 0);
                          const saldoCat = receitasCat - despesasCat;

                          return (
                            <tr key={cat}>
                              <td><strong>{cat}</strong></td>
                              <td className="valor-positivo">R$ {receitasCat.toFixed(2)}</td>
                              <td className="valor-negativo">R$ {despesasCat.toFixed(2)}</td>
                              <td className={saldoCat >= 0 ? 'valor-positivo' : 'valor-negativo'}>
                                R$ {saldoCat.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {abaAtiva === 'openfinance' && (
                <div className="aba-openfinance">
                  <h2>🏦 Open Finance</h2>
                  <button
                    onClick={atualizarOpenFinance}
                    className="btn-primary"
                    disabled={carregando}
                  >
                    {carregando ? '⏳ Atualizando...' : '🔄 Atualizar Dados'}
                  </button>

                  {snapshot && (
                    <div className="snapshot-resumo">
                      <h3>Resumo Financeiro</h3>
                      <div className="cards-snapshot">
                        <div className="card-snapshot">
                          <div className="card-label">🏦 Contas</div>
                          <div className="card-valor">{snapshot.contas?.length || 0}</div>
                        </div>
                        <div className="card-snapshot">
                          <div className="card-label">💳 Cartões</div>
                          <div className="card-valor">{snapshot.cartoes?.length || 0}</div>
                        </div>
                        <div className="card-snapshot">
                          <div className="card-label">📈 Investimentos</div>
                          <div className="card-valor">{snapshot.investimentos?.length || 0}</div>
                        </div>
                        <div className="card-snapshot">
                          <div className="card-label">💰 Operações Crédito</div>
                          <div className="card-valor">{snapshot.operacoes_credito?.length || 0}</div>
                        </div>
                      </div>

                      {snapshot.contas && snapshot.contas.length > 0 && (
                        <div className="detalhes-section">
                          <h4>💰 Contas</h4>
                          <table className="tabela-of">
                            <thead>
                              <tr>
                                <th>Instituição</th>
                                <th>Tipo</th>
                                <th>Agência</th>
                                <th>Número</th>
                                <th>Saldo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {snapshot.contas.map(conta => {
                                const inst = snapshot.instituicoes?.find(i => i.id === conta.instituicao_id);
                                return (
                                  <tr key={conta.id}>
                                    <td>{inst?.nome || 'N/A'}</td>
                                    <td>{conta.tipo}</td>
                                    <td>{conta.agencia}</td>
                                    <td>{conta.numero}</td>
                                    <td className="valor-positivo">R$ {conta.saldo.toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {abaAtiva === 'regras' && (
                <div className="aba-regras">
                  <h2>⚙️ Regras IA</h2>
                  <button
                    onClick={() => setModalAberto('regras')}
                    className="btn-primary"
                  >
                    🛠️ Gerenciar Regras
                  </button>

                  <div className="regras-resumo">
                    <p>Regras ativas: <strong>{regrasIA.filter(r => r.ativa).length}</strong></p>
                    <p>Total de regras: <strong>{regrasIA.length}</strong></p>
                  </div>
                </div>
              )}

              {abaAtiva === 'backup' && (
                <div className="aba-backup">
                  <h2>💾 Backup e Restauração</h2>

                  <div className="backup-actions">
                    <button onClick={exportarBackup} className="btn-export">
                      📥 Exportar Backup
                    </button>

                    <div className="import-group">
                      <label htmlFor="import-backup" className="btn-import">
                        📤 Importar Backup
                      </label>
                      <input
                        id="import-backup"
                        type="file"
                        accept=".json"
                        onChange={importarBackup}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="backup-info">
                    <h3>ℹ️ Informações</h3>
                    <p>O backup contém:</p>
                    <ul>
                      <li>✅ Todas as entradas cadastradas</li>
                      <li>✅ Regras IA configuradas</li>
                      <li>✅ Configurações de projeção</li>
                      <li>❌ Dados do Open Finance (serão recarregados)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modais dos Agentes */}
            {modalAberto === 'ai' && (
              <AIChat
                planilha={planilhaIntegrada}
                onClose={() => setModalAberto(null)}
              />
            )}

            {modalAberto === 'financeiro' && (
              <FinanceiroAgentChat
                snapshot={snapshot}
                onClose={() => setModalAberto(null)}
              />
            )}

            {modalAberto === 'investimento' && (
              <InvestimentoAgentChat
                snapshot={snapshot}
                onClose={() => setModalAberto(null)}
              />
            )}

            {modalAberto === 'regras' && (
              <AgentRulesManager
                regras={regrasIA}
                planilha={planilhaIntegrada}
                snapshot={snapshot}
                onSalvarRegras={setRegrasIA}
                onClose={() => setModalAberto(null)}
              />
            )}
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

