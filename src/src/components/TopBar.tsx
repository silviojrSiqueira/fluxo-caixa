import React from 'react';

interface TopBarProps {
  fonteEntradas: 'database' | 'localStorage';
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ fonteEntradas, onToggleSidebar }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <span className="hamburger-icon">☰</span>
        </button>
        
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar entradas, categorias..." 
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Status Database */}
        <div className="db-status-badge">
          <span className={`status-dot ${fonteEntradas === 'database' ? 'online' : 'offline'}`} />
          <span className="status-text">
            {fonteEntradas === 'database' ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Notificações */}
        <button className="topbar-icon-btn" title="Notificações">
          <span className="icon">🔔</span>
          <span className="badge">3</span>
        </button>

        {/* Ajuda */}
        <button className="topbar-icon-btn" title="Ajuda">
          <span className="icon">❓</span>
        </button>

        {/* Perfil */}
        <div className="user-profile">
          <div className="user-avatar">
            <span>U</span>
          </div>
          <div className="user-info">
            <div className="user-name">Usuário</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};

