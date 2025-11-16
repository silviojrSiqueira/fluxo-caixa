import React, { useState } from 'react';
import { RegraIA, PlanilhaData, OpenFinanceSnapshot } from '../types';
import { AgentRulesService, AvaliacaoRegra } from '../services/agentRulesService';

interface AgentRulesManagerProps {
  regras: RegraIA[];
  planilha: PlanilhaData;
  snapshot?: OpenFinanceSnapshot;
  onSalvarRegras: (regras: RegraIA[]) => void;
  onClose: () => void;
}

export const AgentRulesManager: React.FC<AgentRulesManagerProps> = ({
  regras,
  planilha,
  snapshot,
  onSalvarRegras,
  onClose
}) => {
  const [regrasLocais, setRegrasLocais] = useState<RegraIA[]>(regras);
  const [editando, setEditando] = useState<string | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRegra[]>([]);

  const adicionarRegra = () => {
    const novaRegra: RegraIA = {
      id: `regra-${Date.now()}`,
      titulo: 'Nova Regra',
      condicao: '',
      acao: '',
      ativa: true,
      tipo: 'sugestao',
      prioridade: 'media'
    };
    setRegrasLocais([...regrasLocais, novaRegra]);
    setEditando(novaRegra.id);
  };

  const removerRegra = (id: string) => {
    setRegrasLocais(regrasLocais.filter(r => r.id !== id));
  };

  const atualizarRegra = (id: string, campos: Partial<RegraIA>) => {
    setRegrasLocais(regrasLocais.map(r => 
      r.id === id ? { ...r, ...campos } : r
    ));
  };

  const avaliarRegras = () => {
    const resultados = AgentRulesService.avaliarRegras(regrasLocais, planilha, snapshot);
    setAvaliacoes(resultados);
  };

  const salvar = () => {
    onSalvarRegras(regrasLocais);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚙️ Gerenciar Regras IA</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          <div style={styles.toolbar}>
            <button onClick={adicionarRegra} style={styles.addButton}>
              ➕ Nova Regra
            </button>
            <button onClick={avaliarRegras} style={styles.evalButton}>
              🔍 Avaliar Regras
            </button>
            <button onClick={salvar} style={styles.saveButton}>
              💾 Salvar Tudo
            </button>
          </div>

          {avaliacoes.length > 0 && (
            <div style={styles.avaliacoesContainer}>
              <h3 style={styles.avaliacoesTitle}>📊 Resultados da Avaliação:</h3>
              {avaliacoes.map((av, idx) => (
                <div key={idx} style={styles.avaliacao}>
                  <div style={styles.avaliacaoHeader}>
                    {av.regra.tipo === 'alerta' ? '⚠️' : '💡'} {av.regra.titulo}
                  </div>
                  <div style={styles.avaliacaoMensagem}>{av.mensagem}</div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.regrasList}>
            {regrasLocais.map(regra => (
              <div key={regra.id} style={styles.regraCard}>
                <div style={styles.regraHeader}>
                  <input
                    type="checkbox"
                    checked={regra.ativa}
                    onChange={(e) => atualizarRegra(regra.id, { ativa: e.target.checked })}
                    style={styles.checkbox}
                  />
                  {editando === regra.id ? (
                    <input
                      type="text"
                      value={regra.titulo}
                      onChange={(e) => atualizarRegra(regra.id, { titulo: e.target.value })}
                      style={styles.tituloInput}
                    />
                  ) : (
                    <h3 style={styles.regraTitulo}>{regra.titulo}</h3>
                  )}
                  <div style={styles.regraActions}>
                    <button
                      onClick={() => setEditando(editando === regra.id ? null : regra.id)}
                      style={styles.editButton}
                    >
                      {editando === regra.id ? '✓' : '✏️'}
                    </button>
                    <button
                      onClick={() => removerRegra(regra.id)}
                      style={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {editando === regra.id && (
                  <div style={styles.regraForm}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Tipo:</label>
                      <select
                        value={regra.tipo}
                        onChange={(e) => atualizarRegra(regra.id, { tipo: e.target.value as any })}
                        style={styles.select}
                      >
                        <option value="alerta">Alerta</option>
                        <option value="sugestao">Sugestão</option>
                        <option value="automacao">Automação</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Prioridade:</label>
                      <select
                        value={regra.prioridade}
                        onChange={(e) => atualizarRegra(regra.id, { prioridade: e.target.value as any })}
                        style={styles.select}
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Condição:</label>
                      <input
                        type="text"
                        value={regra.condicao}
                        onChange={(e) => atualizarRegra(regra.id, { condicao: e.target.value })}
                        placeholder="Ex: saldo negativo"
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Ação:</label>
                      <input
                        type="text"
                        value={regra.acao}
                        onChange={(e) => atualizarRegra(regra.id, { acao: e.target.value })}
                        placeholder="Ex: Avisar sobre saldo negativo"
                        style={styles.input}
                      />
                    </div>
                  </div>
                )}

                {editando !== regra.id && (
                  <div style={styles.regraDetalhes}>
                    <div><strong>Condição:</strong> {regra.condicao}</div>
                    <div><strong>Ação:</strong> {regra.acao}</div>
                    <div style={styles.badges}>
                      <span style={{...styles.badge, ...styles[`badge${regra.tipo}`]}}>
                        {regra.tipo}
                      </span>
                      <span style={{...styles.badge, ...styles[`badge${regra.prioridade}`]}}>
                        {regra.prioridade}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {regrasLocais.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhuma regra configurada.</p>
              <p>Clique em "Nova Regra" para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '900px',
    height: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    color: '#333'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px'
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  addButton: {
    padding: '10px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  evalButton: {
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  saveButton: {
    padding: '10px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginLeft: 'auto'
  },
  avaliacoesContainer: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px'
  },
  avaliacoesTitle: {
    marginTop: 0,
    marginBottom: '10px',
    fontSize: '16px'
  },
  avaliacao: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px'
  },
  avaliacaoHeader: {
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  avaliacaoMensagem: {
    fontSize: '14px',
    color: '#555'
  },
  regrasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  regraCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#f9f9f9'
  },
  regraHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  regraTitulo: {
    flex: 1,
    margin: 0,
    fontSize: '16px'
  },
  tituloInput: {
    flex: 1,
    padding: '8px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  regraActions: {
    display: 'flex',
    gap: '5px'
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  regraForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#555'
  },
  select: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  regraDetalhes: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6'
  },
  badges: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  badgealerta: {
    backgroundColor: '#dc3545',
    color: 'white'
  },
  badgesugestao: {
    backgroundColor: '#17a2b8',
    color: 'white'
  },
  badgeautomacao: {
    backgroundColor: '#6f42c1',
    color: 'white'
  },
  badgebaixa: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  badgemedia: {
    backgroundColor: '#ffc107',
    color: '#333'
  },
  badgealta: {
    backgroundColor: '#dc3545',
    color: 'white'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#999'
  }
};

