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
  const [menuAberto, setMenuAberto] = useState(false);

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
  }, [planilhaIntegrada, snapshot, regrasIA]);

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

    try {
      await EntradasService.criarEntrada(entrada);
      setFonteEntradas('database');
      mostrarMensagem('sucesso', '✅ Entrada salva!');
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      mostrarMensagem('sucesso', '⚠️ Salvo localmente');
    }
  };

  const removerEntrada = async (id: string) => {
    setPlanilhaData(prev => ({
      ...prev,
      entradas: prev.entradas.filter(e => e.id !== id)
    }));

    setPlanilhaIntegrada(prev => ({
      ...prev,
      entradas: prev.entradas.filter(e => e.id !== id)
    }));

    try {
      await EntradasService.removerEntrada(id);
      mostrarMensagem('sucesso', '✅ Entrada removida!');
    } catch (error) {
      console.error('Erro ao remover do banco:', error);
      mostrarMensagem('sucesso', '⚠️ Removido localmente');
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
      mostrarMensagem('erro', 'Erro ao conectar com Open Finance');
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
    mostrarMensagem('sucesso', 'Backup exportado!');
  };

  const importarBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        StorageService.importarBackup(conteudo);

        const novaPlanilha = StorageService.carregarPlanilha();
        setPlanilhaData(novaPlanilha);
        setPlanilhaIntegrada(novaPlanilha);
        setRegrasIA(StorageService.carregarRegrasIA());
        setProjecoes(StorageService.carregarProjecoes());

        mostrarMensagem('sucesso', 'Backup restaurado!');
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
          <div className="app-container">
            {/* Header Responsivo */}
            <header className="app-header">
              <div className="header-content">
                <div className="header-left">
                  <button
                    className="menu-toggle"
                    onClick={() => setMenuAberto(!menuAberto)}
                    aria-label="Menu"
                  >
                    ☰
                  </button>
                  <h1 className="app-logo">
                    💰 Fluxo de Caixa
                  </h1>
                </div>

                <div className="header-actions">
                  <div className="db-status">
                    <span className={`status-indicator ${fonteEntradas === 'database' ? 'online' : 'offline'}`} />
                    <span>{fonteEntradas === 'database' ? 'Online' : 'Offline'}</span>
                  </div>

                  <nav className="desktop-nav">
                    <button
                      className={`nav-button ${abaAtiva === 'entradas' ? 'active' : ''}`}
                      onClick={() => setAbaAtiva('entradas')}
                    >
                      📝 Entradas
                    </button>
                    <button
                      className={`nav-button ${abaAtiva === 'consolidado' ? 'active' : ''}`}
                      onClick={() => setAbaAtiva('consolidado')}
                    >
                      📊 Consolidado
                    </button>
                    <button
                      className={`nav-button ${abaAtiva === 'openfinance' ? 'active' : ''}`}
                      onClick={() => setAbaAtiva('openfinance')}
                    >
                      🏦 Open Finance
                    </button>
                    <button
                      className={`nav-button ${abaAtiva === 'regras' ? 'active' : ''}`}
                      onClick={() => setAbaAtiva('regras')}
                    >
                      ⚙️ Regras IA
                    </button>
                    <button
                      className={`nav-button ${abaAtiva === 'backup' ? 'active' : ''}`}
                      onClick={() => setAbaAtiva('backup')}
                    >
                      💾 Backup
                    </button>
                  </nav>
                </div>
              </div>
            </header>

            {/* Menu Mobile */}
            <div className={`mobile-menu-overlay ${menuAberto ? 'open' : ''}`} onClick={() => setMenuAberto(false)}>
              <div className={`mobile-menu ${menuAberto ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="mobile-menu-header">
                  <h2>Menu</h2>
                  <button className="close-menu" onClick={() => setMenuAberto(false)}>✕</button>
                </div>
                <nav className="mobile-menu-nav">
                  <button
                    className={`mobile-menu-item ${abaAtiva === 'entradas' ? 'active' : ''}`}
                    onClick={() => { setAbaAtiva('entradas'); setMenuAberto(false); }}
                  >
                    📝 Entradas
                  </button>
                  <button
                    className={`mobile-menu-item ${abaAtiva === 'consolidado' ? 'active' : ''}`}
                    onClick={() => { setAbaAtiva('consolidado'); setMenuAberto(false); }}
                  >
                    📊 Consolidado
                  </button>
                  <button
                    className={`mobile-menu-item ${abaAtiva === 'openfinance' ? 'active' : ''}`}
                    onClick={() => { setAbaAtiva('openfinance'); setMenuAberto(false); }}
                  >
                    🏦 Open Finance
                  </button>
                  <button
                    className={`mobile-menu-item ${abaAtiva === 'regras' ? 'active' : ''}`}
                    onClick={() => { setAbaAtiva('regras'); setMenuAberto(false); }}
                  >
                    ⚙️ Regras IA
                  </button>
                  <button
                    className={`mobile-menu-item ${abaAtiva === 'backup' ? 'active' : ''}`}
                    onClick={() => { setAbaAtiva('backup'); setMenuAberto(false); }}
                  >
                    💾 Backup
                  </button>
                  <div className="menu-divider" />
                  <button
                    className="mobile-menu-item"
                    onClick={() => { setModalAberto('ai'); setMenuAberto(false); }}
                  >
                    💬 Chat IA
                  </button>
                  <button
                    className="mobile-menu-item"
                    onClick={() => { setModalAberto('financeiro'); setMenuAberto(false); }}
                  >
                    🏦 Agente Financeiro
                  </button>
                  <button
                    className="mobile-menu-item"
                    onClick={() => { setModalAberto('investimento'); setMenuAberto(false); }}
                  >
                    📊 Agente Investimentos
                  </button>
                  <div className="menu-divider" />
                  <Link to="/mobile-preview" className="mobile-menu-item">
                    📱 Preview Original
                  </Link>
                </nav>
              </div>
            </div>

            {/* Mensagem Toast */}
            {mensagem && (
              <div className={`message ${mensagem.tipo}`}>
                {mensagem.texto}
              </div>
            )}

            {/* Conteúdo Principal */}
            <main className="app-main">
              {/* Cards de Resumo */}
              <div className="summary-cards">
                <div className="summary-card receitas">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <div className="card-label">Receitas</div>
                    <div className="card-value">R$ {resumo.receitas.toFixed(2)}</div>
                  </div>
                </div>

                <div className="summary-card despesas">
                  <div className="card-icon">💸</div>
                  <div className="card-content">
                    <div className="card-label">Despesas</div>
                    <div className="card-value">R$ {resumo.despesas.toFixed(2)}</div>
                  </div>
                </div>

                <div className="summary-card saldo">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <div className="card-label">Saldo</div>
                    <div className={`card-value ${resumo.saldo >= 0 ? 'positive' : 'negative'}`}>
                      R$ {resumo.saldo.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo das Abas */}
              {abaAtiva === 'entradas' && (
                <>
                  <section className="section">
                    <div className="section-header">
                      <h2 className="section-title">➕ Nova Entrada</h2>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Tipo</label>
                        <select
                          className="form-select"
                          value={novaEntrada.tipo}
                          onChange={(e) => setNovaEntrada({ ...novaEntrada, tipo: e.target.value as any })}
                        >
                          <option value="receita">💰 Receita</option>
                          <option value="despesa">💸 Despesa</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Categoria</label>
                        <input
                          className="form-input"
                          type="text"
                          value={novaEntrada.categoria}
                          onChange={(e) => setNovaEntrada({ ...novaEntrada, categoria: e.target.value })}
                          list="categorias"
                          placeholder="Ex: Salário, Alimentação..."
                        />
                        <datalist id="categorias">
                          {planilhaData.categorias.map(cat => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Descrição</label>
                        <input
                          className="form-input"
                          type="text"
                          value={novaEntrada.descricao}
                          onChange={(e) => setNovaEntrada({ ...novaEntrada, descricao: e.target.value })}
                          placeholder="Descreva a entrada..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Valor (R$)</label>
                        <input
                          className="form-input"
                          type="number"
                          step="0.01"
                          value={novaEntrada.valor}
                          onChange={(e) => setNovaEntrada({ ...novaEntrada, valor: parseFloat(e.target.value) })}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Data</label>
                        <input
                          className="form-input"
                          type="date"
                          value={novaEntrada.data}
                          onChange={(e) => setNovaEntrada({ ...novaEntrada, data: e.target.value })}
                        />
                      </div>
                    </div>

                    <button onClick={adicionarEntrada} className="btn btn-primary">
                      ➕ Adicionar Entrada
                    </button>
                  </section>

                  <section className="section">
                    <div className="section-header">
                      <h2 className="section-title">
                        📋 Entradas ({planilhaData.entradas.length})
                      </h2>
                    </div>

                    {planilhaData.entradas.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <div className="empty-state-title">Nenhuma entrada ainda</div>
                        <div className="empty-state-description">
                          Comece adicionando sua primeira receita ou despesa!
                        </div>
                      </div>
                    ) : (
                      <div className="entries-list">
                        {planilhaData.entradas
                          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                          .map(entrada => (
                            <div key={entrada.id} className="entry-card">
                              <div className="entry-info">
                                <div className="entry-category">{entrada.categoria}</div>
                                <div className="entry-description">{entrada.descricao}</div>
                                <div className="entry-date">
                                  {new Date(entrada.data).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              <div className="entry-actions">
                                <div className={`entry-value ${entrada.tipo}`}>
                                  {entrada.tipo === 'receita' ? '+' : '-'}R$ {entrada.valor.toFixed(2)}
                                </div>
                                <button
                                  onClick={() => removerEntrada(entrada.id)}
                                  className="btn-icon"
                                  aria-label="Remover"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {abaAtiva === 'consolidado' && (
                <section className="section">
                  <div className="section-header">
                    <h2 className="section-title">📊 Visão Consolidada</h2>
                    <button onClick={exportarExcel} className="btn btn-success" disabled={carregando}>
                      {carregando ? '⏳ Exportando...' : '📥 Exportar Excel'}
                    </button>
                  </div>

                  <div className="entries-list">
                    {Array.from(new Set(planilhaIntegrada.entradas.map(e => e.categoria))).map(cat => {
                      const receitasCat = planilhaIntegrada.entradas
                        .filter(e => e.categoria === cat && e.tipo === 'receita')
                        .reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
                      const despesasCat = planilhaIntegrada.entradas
                        .filter(e => e.categoria === cat && e.tipo === 'despesa')
                        .reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
                      const saldoCat = receitasCat - despesasCat;

                      return (
                        <div key={cat} className="entry-card">
                          <div className="entry-info">
                            <div className="entry-category">CATEGORIA</div>
                            <div className="entry-description">{cat}</div>
                            <div className="entry-date">
                              Receitas: R$ {receitasCat.toFixed(2)} | Despesas: R$ {despesasCat.toFixed(2)}
                            </div>
                          </div>
                          <div className={`entry-value ${saldoCat >= 0 ? 'receita' : 'despesa'}`}>
                            R$ {saldoCat.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {abaAtiva === 'openfinance' && (
                <section className="section">
                  <div className="section-header">
                    <h2 className="section-title">🏦 Open Finance</h2>
                    <button
                      onClick={atualizarOpenFinance}
                      className="btn btn-primary"
                      disabled={carregando}
                    >
                      {carregando ? '⏳ Atualizando...' : '🔄 Atualizar'}
                    </button>
                  </div>

                  {!snapshot ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🏦</div>
                      <div className="empty-state-title">Conecte-se ao Open Finance</div>
                      <div className="empty-state-description">
                        Clique em "Atualizar" para buscar seus dados financeiros
                      </div>
                    </div>
                  ) : (
                    <div className="summary-cards">
                      <div className="summary-card">
                        <div className="card-icon">🏦</div>
                        <div className="card-content">
                          <div className="card-label">Contas</div>
                          <div className="card-value">{snapshot.contas?.length || 0}</div>
                        </div>
                      </div>
                      <div className="summary-card">
                        <div className="card-icon">💳</div>
                        <div className="card-content">
                          <div className="card-label">Cartões</div>
                          <div className="card-value">{snapshot.cartoes?.length || 0}</div>
                        </div>
                      </div>
                      <div className="summary-card">
                        <div className="card-icon">📈</div>
                        <div className="card-content">
                          <div className="card-label">Investimentos</div>
                          <div className="card-value">{snapshot.investimentos?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {abaAtiva === 'regras' && (
                <section className="section">
                  <div className="section-header">
                    <h2 className="section-title">⚙️ Regras IA</h2>
                    <button
                      onClick={() => setModalAberto('regras')}
                      className="btn btn-primary"
                    >
                      🛠️ Gerenciar
                    </button>
                  </div>

                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="card-icon">✅</div>
                      <div className="card-content">
                        <div className="card-label">Regras Ativas</div>
                        <div className="card-value">{regrasIA.filter(r => r.ativa).length}</div>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="card-icon">📋</div>
                      <div className="card-content">
                        <div className="card-label">Total de Regras</div>
                        <div className="card-value">{regrasIA.length}</div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {abaAtiva === 'backup' && (
                <section className="section">
                  <div className="section-header">
                    <h2 className="section-title">💾 Backup e Restauração</h2>
                  </div>

                  <div className="btn-group">
                    <button onClick={exportarBackup} className="btn btn-success">
                      📥 Exportar Backup
                    </button>

                    <label htmlFor="import-backup" className="btn btn-primary">
                      📤 Importar Backup
                      <input
                        id="import-backup"
                        type="file"
                        accept=".json"
                        onChange={importarBackup}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>ℹ️ O backup contém:</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      <li>✅ Todas as entradas cadastradas</li>
                      <li>✅ Regras IA configuradas</li>
                      <li>✅ Configurações de projeção</li>
                      <li>❌ Dados do Open Finance (serão recarregados)</li>
                    </ul>
                  </div>
                </section>
              )}
            </main>

            {/* Bottom Navigation (Mobile) */}
            <nav className="bottom-nav">
              <div className="bottom-nav-content">
                <button
                  className={`bottom-nav-item ${abaAtiva === 'entradas' ? 'active' : ''}`}
                  onClick={() => setAbaAtiva('entradas')}
                >
                  <div className="bottom-nav-icon">📝</div>
                  <div className="bottom-nav-label">Entradas</div>
                </button>

                <button
                  className={`bottom-nav-item ${abaAtiva === 'consolidado' ? 'active' : ''}`}
                  onClick={() => setAbaAtiva('consolidado')}
                >
                  <div className="bottom-nav-icon">📊</div>
                  <div className="bottom-nav-label">Relatório</div>
                </button>

                <button
                  className="bottom-nav-item main"
                  onClick={() => setMenuAberto(true)}
                >
                  <div className="bottom-nav-icon">➕</div>
                </button>

                <button
                  className={`bottom-nav-item ${abaAtiva === 'openfinance' ? 'active' : ''}`}
                  onClick={() => setAbaAtiva('openfinance')}
                >
                  <div className="bottom-nav-icon">🏦</div>
                  <div className="bottom-nav-label">Open</div>
                </button>

                <button
                  className="bottom-nav-item"
                  onClick={() => setModalAberto('ai')}
                >
                  <div className="bottom-nav-icon">💬</div>
                  <div className="bottom-nav-label">IA</div>
                </button>
              </div>
            </nav>

            {/* Modais */}
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

