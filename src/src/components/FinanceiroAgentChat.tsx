import React, { useState, useRef, useEffect } from 'react';
import { MensagemChat, OpenFinanceSnapshot } from '../types';
import { FinanceiroAgentService } from '../services/financeiroAgentService';

interface FinanceiroAgentChatProps {
  snapshot?: OpenFinanceSnapshot;
  onClose: () => void;
}

export const FinanceiroAgentChat: React.FC<FinanceiroAgentChatProps> = ({ snapshot, onClose }) => {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([
    {
      role: 'assistant',
      content: '🏦 Olá! Sou seu Agente Financeiro especializado em operações de crédito, cartões e análises de taxas. Como posso ajudar?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!input.trim() || carregando) return;

    const novaMensagem: MensagemChat = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMensagens(prev => [...prev, novaMensagem]);
    setInput('');
    setCarregando(true);

    try {
      const resposta = await FinanceiroAgentService.chat([...mensagens, novaMensagem], snapshot);
      
      setMensagens(prev => [...prev, {
        role: 'assistant',
        content: resposta,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMensagens(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        timestamp: Date.now()
      }]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const sugestoesRapidas = [
    'Analisar meus financiamentos',
    'Como estão meus cartões?',
    'Simular amortização',
    'Analisar taxas de juros'
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>🏦 Agente Financeiro</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.messagesContainer}>
          {mensagens.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
              }}
            >
              <div style={styles.messageRole}>
                {msg.role === 'user' ? '👤 Você' : '🏦 Agente Financeiro'}
              </div>
              <div style={styles.messageContent}>{msg.content}</div>
            </div>
          ))}
          {carregando && (
            <div style={{...styles.message, ...styles.assistantMessage}}>
              <div style={styles.messageContent}>
                <em>Analisando...</em>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {mensagens.length === 1 && (
          <div style={styles.quickSuggestions}>
            <div style={styles.suggestionsTitle}>💡 Perguntas sugeridas:</div>
            <div style={styles.suggestionButtons}>
              {sugestoesRapidas.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(sug)}
                  style={styles.suggestionButton}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.inputContainer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Analisar meus financiamentos..."
            style={styles.input}
            rows={2}
            disabled={carregando}
          />
          <button
            onClick={enviarMensagem}
            disabled={!input.trim() || carregando}
            style={{
              ...styles.sendButton,
              ...((!input.trim() || carregando) && styles.sendButtonDisabled)
            }}
          >
            Enviar
          </button>
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
    maxWidth: '800px',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7ff'
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
    color: '#666',
    padding: '0 10px'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#f9f9f9'
  },
  message: {
    marginBottom: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    maxWidth: '80%'
  },
  userMessage: {
    backgroundColor: '#0066cc',
    color: 'white',
    marginLeft: 'auto'
  },
  assistantMessage: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    marginRight: 'auto'
  },
  messageRole: {
    fontSize: '12px',
    marginBottom: '4px',
    opacity: 0.8,
    fontWeight: 'bold'
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5'
  },
  quickSuggestions: {
    padding: '15px 20px',
    backgroundColor: '#f0f7ff',
    borderTop: '1px solid #e0e0e0'
  },
  suggestionsTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#555'
  },
  suggestionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  suggestionButton: {
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid #0066cc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#0066cc',
    transition: 'all 0.2s'
  },
  inputContainer: {
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none'
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
};

