import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  abaAtiva: string;
  onChangeAba: (aba: 'entradas' | 'consolidado' | 'backup' | 'openfinance' | 'regras') => void;
  onAbrirModal: (modal: 'ai' | 'financeiro' | 'investimento' | 'regras') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  abaAtiva, 
  onChangeAba, 
  onAbrirModal,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">💰</div>
          <div className="logo-text">
            <div className="logo-title">Fluxo Caixa</div>
            <div className="logo-subtitle">Financeiro</div>
          </div>
        </div>

        {/* Menu Principal */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">MENU PRINCIPAL</div>
            
            <button
              className={`nav-item ${abaAtiva === 'entradas' ? 'active' : ''}`}
              onClick={() => { onChangeAba('entradas'); onClose(); }}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-label">Entradas</span>
              {abaAtiva === 'entradas' && <span className="nav-indicator" />}
            </button>

            <button
              className={`nav-item ${abaAtiva === 'consolidado' ? 'active' : ''}`}
              onClick={() => { onChangeAba('consolidado'); onClose(); }}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Consolidado</span>
              {abaAtiva === 'consolidado' && <span className="nav-indicator" />}
            </button>

            <button
              className={`nav-item ${abaAtiva === 'openfinance' ? 'active' : ''}`}
              onClick={() => { onChangeAba('openfinance'); onClose(); }}
            >
              <span className="nav-icon">🏦</span>
              <span className="nav-label">Open Finance</span>
              {abaAtiva === 'openfinance' && <span className="nav-indicator" />}
            </button>

            <button
              className={`nav-item ${abaAtiva === 'regras' ? 'active' : ''}`}
              onClick={() => { onChangeAba('regras'); onClose(); }}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Regras IA</span>
              {abaAtiva === 'regras' && <span className="nav-indicator" />}
            </button>

            <button
              className={`nav-item ${abaAtiva === 'backup' ? 'active' : ''}`}
              onClick={() => { onChangeAba('backup'); onClose(); }}
            >
              <span className="nav-icon">💾</span>
              <span className="nav-label">Backup</span>
              {abaAtiva === 'backup' && <span className="nav-indicator" />}
            </button>
          </div>

          {/* Agentes IA */}
          <div className="nav-section">
            <div className="nav-section-title">ASSISTENTES IA</div>
            
            <button
              className="nav-item"
              onClick={() => { onAbrirModal('ai'); onClose(); }}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-label">Chat Geral</span>
            </button>

            <button
              className="nav-item"
              onClick={() => { onAbrirModal('financeiro'); onClose(); }}
            >
              <span className="nav-icon">🏦</span>
              <span className="nav-label">Agente Financeiro</span>
            </button>

            <button
              className="nav-item"
              onClick={() => { onAbrirModal('investimento'); onClose(); }}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-label">Investimentos</span>
            </button>
          </div>

          {/* Links Extras */}
          <div className="nav-section">
            <Link to="/mobile-preview" className="nav-item" onClick={onClose}>
              <span className="nav-icon">📱</span>
              <span className="nav-label">Preview Mobile</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="version-info">
            <div className="version-label">Versão</div>
            <div className="version-number">2.0 SaaS</div>
          </div>
        </div>
      </aside>
    </>
  );
};

