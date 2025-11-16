# 🧪 Guia Rápido de Testes - Versão Responsiva

## ✅ Checklist de Testes

Use este guia para testar a nova versão responsiva!

---

## 📱 **MOBILE (iPhone/Android)**

### **1. Navegação**
- [ ] Menu hamburger (☰) abre corretamente
- [ ] Menu lateral desliza da esquerda
- [ ] Fechar menu com X funciona
- [ ] Fechar menu tocando fora funciona
- [ ] Bottom navigation está fixa embaixo

### **2. Cards de Resumo**
- [ ] Cards grandes e legíveis
- [ ] Valores formatados (R$ 0,00)
- [ ] Cores corretas:
  - Verde = Receitas
  - Vermelho = Despesas
  - Azul = Saldo
- [ ] Saldo muda cor (verde positivo, vermelho negativo)

### **3. Formulário de Entrada**
- [ ] Campos grandes e fáceis de clicar
- [ ] Teclado numérico abre no campo de valor
- [ ] Seletor de data funciona
- [ ] Botão "Adicionar" responde ao toque
- [ ] Feedback visual ao adicionar

### **4. Lista de Entradas**
- [ ] Cards de entrada são grandes
- [ ] Descrição legível
- [ ] Data formatada (DD/MM/AAAA)
- [ ] Valor com cor (verde/vermelho)
- [ ] Botão deletar funciona
- [ ] Scroll suave

### **5. Bottom Navigation**
- [ ] 5 botões visíveis
- [ ] Botão central (➕) maior e elevado
- [ ] Ícones claros
- [ ] Labels legíveis
- [ ] Ativo muda de cor (azul)
- [ ] Não some ao rolar a página

### **6. Responsividade**
- [ ] Sem scroll horizontal
- [ ] Conteúdo não corta nas laterais
- [ ] Mensagens (toasts) aparecem corretamente
- [ ] Modais (IA) abrem em tela cheia

---

## 💻 **DESKTOP (Notebook/PC)**

### **1. Header**
- [ ] Logo visível
- [ ] Status do banco (online/offline) com bolinha
- [ ] Navegação horizontal aparece
- [ ] Abas ficam azuis quando ativas
- [ ] Menu hamburger **desaparece**

### **2. Cards de Resumo**
- [ ] 3 cards lado a lado
- [ ] Espaçamento adequado
- [ ] Hover effect (elevação)
- [ ] Bordas laterais coloridas

### **3. Layout**
- [ ] Conteúdo centralizado (max 1400px)
- [ ] Margens laterais adequadas
- [ ] Formulário em grid 3-4 colunas
- [ ] Lista de entradas com largura adequada
- [ ] Bottom navigation **desaparece**

### **4. Interatividade**
- [ ] Botões com hover effect
- [ ] Cursor pointer nos clicáveis
- [ ] Transições suaves
- [ ] Cards com shadow ao hover

---

## 📊 **TABLET (iPad)**

### **1. Layout Híbrido**
- [ ] Cards em grid 2-3 colunas
- [ ] Navegação: depende (testar ambos)
- [ ] Formulário em 2 colunas
- [ ] Boa legibilidade

### **2. Touch & Mouse**
- [ ] Funciona com toque
- [ ] Funciona com mouse
- [ ] Botões têm tamanho adequado

---

## 🎨 **VISUAL**

### **Cores**
- [ ] Azul primário: #007bff
- [ ] Verde receitas: #10b981
- [ ] Vermelho despesas: #ef4444
- [ ] Fundo cinza claro: #f5f5f5
- [ ] Cards brancos: #ffffff

### **Tipografia**
- [ ] Fonte legível (system font)
- [ ] Tamanhos adequados
- [ ] Hierarquia visual clara

### **Espaçamento**
- [ ] Margens consistentes
- [ ] Padding adequado
- [ ] Não muito apertado
- [ ] Não muito espaçado

### **Bordas**
- [ ] Cantos arredondados (8px, 12px)
- [ ] Sombras suaves
- [ ] Sem arestas duras

---

## ⚡ **FUNCIONALIDADES**

### **Adicionar Entrada**
- [ ] Formulário funciona
- [ ] Validação de campos obrigatórios
- [ ] Feedback ao salvar
- [ ] Entrada aparece na lista
- [ ] Salva no banco PostgreSQL
- [ ] Fallback para localStorage se banco offline

### **Remover Entrada**
- [ ] Botão deletar visível
- [ ] Remove da lista
- [ ] Remove do banco
- [ ] Feedback visual

### **Resumo**
- [ ] Calcula receitas corretamente
- [ ] Calcula despesas corretamente
- [ ] Calcula saldo (receitas - despesas)
- [ ] Atualiza em tempo real

### **Navegação entre Abas**
- [ ] Entradas
- [ ] Consolidado
- [ ] Open Finance
- [ ] Regras IA
- [ ] Backup

### **Agentes IA**
- [ ] Chat IA abre
- [ ] Agente Financeiro abre
- [ ] Agente Investimentos abre
- [ ] Botão fechar funciona

### **Open Finance**
- [ ] Botão atualizar funciona
- [ ] Mostra cards com dados
- [ ] Fallback se sem dados

### **Backup**
- [ ] Exportar funciona (baixa .json)
- [ ] Importar funciona (sobe .json)
- [ ] Dados restaurados corretamente

### **Excel Export**
- [ ] Botão exportar funciona
- [ ] Baixa arquivo .xlsx
- [ ] Arquivo abre no Excel

---

## 🔍 **COMPARAÇÃO**

### **Versão Original vs Responsiva**

| Aspecto | Original | Responsiva |
|---------|----------|------------|
| Mobile | ❌ Difícil | ✅ Perfeito |
| Tablet | ⚠️ OK | ✅ Ótimo |
| Desktop | ✅ Bom | ✅ Melhor |
| Visual | 📊 Funcional | 🎨 Moderno |
| UX | ⚠️ Básico | ✅ Polido |
| Cores | 🔵 Padrão | 🌈 Vibrante |
| Navegação | 📋 Tabs | 🍔 Menu + Bottom |

---

## 📸 **Screenshots Recomendados**

Tire prints para comparar:

1. **Mobile (375px)**
   - Home com resumo
   - Formulário de entrada
   - Lista de entradas
   - Menu aberto

2. **Tablet (768px)**
   - Layout híbrido
   - Navegação

3. **Desktop (1920px)**
   - Tela cheia
   - Hover effects
   - Grid de cards

---

## 🐛 **Bugs Conhecidos?**

Se encontrar bugs, anote aqui:

1. [ ] Bug: _________________
2. [ ] Bug: _________________
3. [ ] Bug: _________________

---

## ⭐ **Avaliação**

Depois de testar, avalie:

**Design:**
- [ ] ⭐⭐⭐⭐⭐ Excelente
- [ ] ⭐⭐⭐⭐ Bom
- [ ] ⭐⭐⭐ OK
- [ ] ⭐⭐ Precisa melhorar
- [ ] ⭐ Não gostei

**Usabilidade Mobile:**
- [ ] ⭐⭐⭐⭐⭐ Excelente
- [ ] ⭐⭐⭐⭐ Bom
- [ ] ⭐⭐⭐ OK
- [ ] ⭐⭐ Precisa melhorar
- [ ] ⭐ Não gostei

**Performance:**
- [ ] ⭐⭐⭐⭐⭐ Muito rápido
- [ ] ⭐⭐⭐⭐ Rápido
- [ ] ⭐⭐⭐ OK
- [ ] ⭐⭐ Lento
- [ ] ⭐ Muito lento

---

## 🎯 **Decisão Final**

Após testar:

- [ ] **Substituir a original** - Versão responsiva é melhor!
- [ ] **Manter as duas** - Usar rotas diferentes
- [ ] **Melhorar a responsiva** - Precisa ajustes (liste abaixo)
- [ ] **Manter a original** - Prefiro a original

**Ajustes necessários:**
1. _______________________________
2. _______________________________
3. _______________________________

---

## 📝 **Notas**

Anote aqui suas impressões:

```
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
```

---

**Bons testes!** 🚀

