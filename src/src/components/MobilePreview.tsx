import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlanilhaData, OpenFinanceSnapshot } from '../types';

interface MobilePreviewProps {
  planilha: PlanilhaData;
  snapshot?: OpenFinanceSnapshot;
  onAbrirAgente: (tipo: 'ai' | 'financeiro' | 'investimento') => void;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({ planilha, snapshot, onAbrirAgente }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);

  const calcularResumo = () => {
    const receitas = planilha.entradas
      .filter(e => e.tipo === 'receita')
      .reduce((acc, e) => acc + e.valor, 0);
    
    const despesas = planilha.entradas
      .filter(e => e.tipo === 'despesa')
      .reduce((acc, e) => acc + e.valor, 0);
    
    return { receitas, despesas, saldo: receitas - despesas };
  };

  const resumo = calcularResumo();

  const transacoesRecentes = planilha.entradas
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 10);

  return (
    <div style={styles.container}>
      {/* Header Mobile */}
      <header style={styles.header}>
        <button onClick={() => setMenuAberto(!menuAberto)} style={styles.menuButton}>
          ☰
        </button>
        <h1 style={styles.logo}>💰 Fluxo de Caixa</h1>
        <button onClick={() => setNotificacoesAbertas(!notificacoesAbertas)} style={styles.notifButton}>
          🔔
        </button>
      </header>

      {/* Menu Lateral */}
      {menuAberto && (
        <div style={styles.menuOverlay} onClick={() => setMenuAberto(false)}>
          <div style={styles.menuLateral} onClick={(e) => e.stopPropagation()}>
            <div style={styles.menuHeader}>
              <h2 style={styles.menuTitle}>Menu</h2>
              <button onClick={() => setMenuAberto(false)} style={styles.closeMenu}>✕</button>
            </div>
            <nav style={styles.menuNav}>
              <Link to="/" style={styles.menuItem}>🏠 Voltar para Web</Link>
              <div style={styles.menuDivider} />
              <button onClick={() => onAbrirAgente('ai')} style={styles.menuItem}>
                💬 Chat IA
              </button>
              <button onClick={() => onAbrirAgente('financeiro')} style={styles.menuItem}>
                🏦 Agente Financeiro
              </button>
              <button onClick={() => onAbrirAgente('investimento')} style={styles.menuItem}>
                📊 Agente Investimentos
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Painel de Notificações */}
      {notificacoesAbertas && (
        <div style={styles.notificacoes}>
          <h3 style={styles.notifTitle}>🔔 Notificações</h3>
          <div style={styles.notifItem}>
            <span>💡</span>
            <span>Seu saldo está positivo! Considere investir.</span>
          </div>
          <div style={styles.notifItem}>
            <span>⚠️</span>
            <span>Fatura do cartão vence em 5 dias</span>
          </div>
          <button onClick={() => setNotificacoesAbertas(false)} style={styles.closeNotif}>
            Fechar
          </button>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main style={styles.main}>
        {/* Cards de Resumo */}
        <div style={styles.cardsResumo}>
          <div style={{...styles.cardResumo, ...styles.cardReceitas}}>
            <div style={styles.cardIcon}>💰</div>
            <div>
              <div style={styles.cardLabel}>Receitas</div>
              <div style={styles.cardValor}>R$ {resumo.receitas.toFixed(2)}</div>
            </div>
          </div>

          <div style={{...styles.cardResumo, ...styles.cardDespesas}}>
            <div style={styles.cardIcon}>💸</div>
            <div>
              <div style={styles.cardLabel}>Despesas</div>
              <div style={styles.cardValor}>R$ {resumo.despesas.toFixed(2)}</div>
            </div>
          </div>

          <div style={{...styles.cardResumo, ...styles.cardSaldo}}>
            <div style={styles.cardIcon}>📊</div>
            <div>
              <div style={styles.cardLabel}>Saldo</div>
              <div style={{
                ...styles.cardValor,
                color: resumo.saldo >= 0 ? '#10b981' : '#ef4444'
              }}>
                R$ {resumo.saldo.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🚀 Ações Rápidas</h2>
          <div style={styles.acoesGrid}>
            <button style={styles.acaoBtn}>
              ➕<br/>Nova Entrada
            </button>
            <button style={styles.acaoBtn}>
              📊<br/>Relatórios
            </button>
            <button style={styles.acaoBtn}>
              🏦<br/>Contas
            </button>
            <button style={styles.acaoBtn}>
              💳<br/>Cartões
            </button>
          </div>
        </section>

        {/* Transações Recentes */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Transações Recentes</h2>
          {transacoesRecentes.map((transacao) => (
            <div key={transacao.id} style={styles.transacaoCard}>
              <div style={styles.transacaoInfo}>
                <div style={styles.transacaoCategoria}>{transacao.categoria}</div>
                <div style={styles.transacaoDescricao}>{transacao.descricao}</div>
                <div style={styles.transacaoData}>
                  {new Date(transacao.data).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div style={{
                ...styles.transacaoValor,
                color: transacao.tipo === 'receita' ? '#10b981' : '#ef4444'
              }}>
                {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
              </div>
            </div>
          ))}
        </section>

        {/* Open Finance Summary */}
        {snapshot && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🏦 Open Finance</h2>
            <div style={styles.ofCards}>
              <div style={styles.ofCard}>
                <div style={styles.ofIcon}>🏦</div>
                <div style={styles.ofLabel}>Contas</div>
                <div style={styles.ofValor}>{snapshot.contas?.length || 0}</div>
              </div>
              <div style={styles.ofCard}>
                <div style={styles.ofIcon}>💳</div>
                <div style={styles.ofLabel}>Cartões</div>
                <div style={styles.ofValor}>{snapshot.cartoes?.length || 0}</div>
              </div>
              <div style={styles.ofCard}>
                <div style={styles.ofIcon}>📈</div>
                <div style={styles.ofLabel}>Investimentos</div>
                <div style={styles.ofValor}>{snapshot.investimentos?.length || 0}</div>
              </div>
            </div>
          </section>
        )}

        {/* Assistentes IA */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🤖 Assistentes IA</h2>
          <div style={styles.assistentesGrid}>
            <button onClick={() => onAbrirAgente('ai')} style={styles.assistenteCard}>
              <div style={styles.assistenteIcon}>💬</div>
              <div style={styles.assistenteNome}>Chat Geral</div>
            </button>
            <button onClick={() => onAbrirAgente('financeiro')} style={styles.assistenteCard}>
              <div style={styles.assistenteIcon}>🏦</div>
              <div style={styles.assistenteNome}>Financeiro</div>
            </button>
            <button onClick={() => onAbrirAgente('investimento')} style={styles.assistenteCard}>
              <div style={styles.assistenteIcon}>📊</div>
              <div style={styles.assistenteNome}>Investimentos</div>
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <button style={styles.navItem}>
          <div style={styles.navIcon}>🏠</div>
          <div style={styles.navLabel}>Início</div>
        </button>
        <button style={styles.navItem}>
          <div style={styles.navIcon}>📊</div>
          <div style={styles.navLabel}>Relatórios</div>
        </button>
        <button style={{...styles.navItem, ...styles.navItemMain}}>
          <div style={styles.navIconMain}>➕</div>
        </button>
        <button style={styles.navItem}>
          <div style={styles.navIcon}>💳</div>
          <div style={styles.navLabel}>Cartões</div>
        </button>
        <button style={styles.navItem}>
          <div style={styles.navIcon}>⚙️</div>
          <div style={styles.navLabel}>Config</div>
        </button>
      </nav>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '430px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    paddingBottom: '70px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px 10px'
  },
  logo: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  },
  notifButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px 10px'
  },
  menuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200
  },
  menuLateral: {
    backgroundColor: 'white',
    width: '280px',
    height: '100%',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.2)'
  },
  menuHeader: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  menuTitle: {
    margin: 0,
    fontSize: '20px'
  },
  closeMenu: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer'
  },
  menuNav: {
    padding: '10px 0'
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '15px 20px',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#333',
    transition: 'background 0.2s'
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '10px 0'
  },
  notificacoes: {
    position: 'fixed',
    top: '60px',
    right: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '15px',
    width: '300px',
    zIndex: 150
  },
  notifTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px'
  },
  notifItem: {
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    marginBottom: '8px',
    display: 'flex',
    gap: '10px',
    fontSize: '14px'
  },
  closeNotif: {
    marginTop: '10px',
    padding: '8px',
    width: '100%',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  main: {
    padding: '15px'
  },
  cardsResumo: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
    marginBottom: '20px'
  },
  cardResumo: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  cardReceitas: {
    borderLeft: '4px solid #10b981'
  },
  cardDespesas: {
    borderLeft: '4px solid #ef4444'
  },
  cardSaldo: {
    borderLeft: '4px solid #3b82f6'
  },
  cardIcon: {
    fontSize: '32px'
  },
  cardLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px'
  },
  cardValor: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333'
  },
  section: {
    marginBottom: '25px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333'
  },
  acoesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  acaoBtn: {
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '20px 10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    lineHeight: '1.4'
  },
  transacaoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  transacaoInfo: {
    flex: 1
  },
  transacaoCategoria: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px'
  },
  transacaoDescricao: {
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  transacaoData: {
    fontSize: '12px',
    color: '#999'
  },
  transacaoValor: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  ofCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  ofCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  ofIcon: {
    fontSize: '28px',
    marginBottom: '8px'
  },
  ofLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px'
  },
  ofValor: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#007bff'
  },
  assistentesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  assistenteCard: {
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '20px 10px',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  assistenteIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  assistenteNome: {
    fontSize: '13px',
    fontWeight: '500'
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: '430px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
  },
  navItem: {
    background: 'none',
    border: 'none',
    padding: '5px',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  navItemMain: {
    marginTop: '-20px'
  },
  navIcon: {
    fontSize: '22px'
  },
  navIconMain: {
    fontSize: '28px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)'
  },
  navLabel: {
    fontSize: '11px',
    color: '#666'
  }
};

