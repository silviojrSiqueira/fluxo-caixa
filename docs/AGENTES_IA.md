# Documentação dos Agentes IA

## Visão Geral

O sistema de Fluxo de Caixa possui três agentes IA especializados, cada um focado em um domínio específico das finanças pessoais. Todos funcionam com lógica baseada em regras (simulação de IA) e podem ser facilmente integrados com APIs de IA real (OpenAI, Claude, etc).

## 1. Chat IA Geral (AIChat)

### Objetivo
Assistente generalista para análises de fluxo de caixa e perguntas gerais sobre finanças.

### Funcionalidades

#### Análises Suportadas:

**1. Análise de Saldo**
- Palavras-chave: "saldo", "total"
- Calcula receitas vs despesas
- Indica % de economia
- Recomendações baseadas em percentual

**2. Análise de Despesas**
- Palavras-chave: "despesa", "gasto"
- Top 5 categorias por valor
- Percentual de cada categoria
- Total geral de despesas

**3. Análise de Receitas**
- Palavras-chave: "receita", "entrada"
- Total de receitas
- Média por lançamento
- Número de fontes de receita

**4. Análise por Categoria**
- Palavras-chave: "categoria"
- Saldo por categoria (receitas - despesas)
- Quantidade de lançamentos
- Ranking por impacto

**5. Análise Mensal**
- Palavras-chave: "mês", "mes", "mensal"
- Últimos 6 meses
- Receitas, despesas e saldo por mês
- Tendências temporais

### Exemplo de Uso

```typescript
import { AIService } from './services/aiService';

const mensagens: MensagemChat[] = [
  { role: 'user', content: 'Como está meu saldo?', timestamp: Date.now() }
];

const resposta = await AIService.chat(mensagens, planilhaData);
```

### Estrutura de Resposta

```
📊 **Análise de Saldo**

💰 Receitas totais: R$ 10.000,00
💸 Despesas totais: R$ 7.500,00
✅ Saldo: R$ 2.500,00

✨ Você está economizando 25.0% da sua renda. Parabéns! Continue assim!
```

## 2. Agente Financeiro (FinanceiroAgentChat)

### Objetivo
Especialista em operações de crédito, cartões, financiamentos e gestão de dívidas.

### Funcionalidades

#### 2.1. Análise de Operações de Crédito

**Palavras-chave:** "financiamento", "empréstimo"

**O que analisa:**
- Total devedor vs valor original
- Percentual já pago
- Detalhamento de cada operação
- Taxa de juros de cada operação
- Parcelas restantes

**Recomendação:** Prioriza operação com maior taxa de juros

#### 2.2. Análise de Cartões

**Palavras-chave:** "cartão", "cartao", "fatura"

**O que analisa:**
- Limite total vs disponível
- Percentual de utilização
- Alerta se utilização > 80%
- Datas de fechamento e vencimento
- Detalhamento por cartão

**Recomendação:** Manter utilização abaixo de 30% do limite

#### 2.3. Simulação de Amortização

**Palavras-chave:** "amortiza", "antecipa"

**O que simula:**
- Redução do saldo devedor
- Economia mensal em juros
- Economia em 12 meses
- Impacto no prazo total

**Exemplo:**
```
Se você amortizar R$ 3.000,00:

✅ Novo saldo: R$ 25.000,00
💵 Economia mensal em juros: R$ 59,70
📅 Economia em 12 meses: R$ 716,40
```

#### 2.4. Análise de Taxas

**Palavras-chave:** "juros", "taxa"

**O que analisa:**
- Ranking de taxas (maior para menor)
- Juros mensais por operação
- Projeção anual de juros
- Total de juros projetados

### Exemplo de Uso

```typescript
import { FinanceiroAgentService } from './services/financeiroAgentService';

const resposta = await FinanceiroAgentService.chat(mensagens, snapshot);
```

### Casos de Uso Recomendados

1. **Priorizar quitação de dívidas**
   - Pergunta: "Analisar taxas de juros"
   - Resultado: Ordem de prioridade para quitação

2. **Decidir sobre amortização**
   - Pergunta: "Simular amortização"
   - Resultado: Cálculo de economia

3. **Gerenciar limites de cartão**
   - Pergunta: "Como estão meus cartões?"
   - Resultado: Utilização e alertas

## 3. Agente de Investimentos (InvestimentoAgentChat)

### Objetivo
Especialista em análise de carteira, rentabilidade, liquidez e estratégias de investimento.

### Funcionalidades

#### 3.1. Análise de Rentabilidade

**Palavras-chave:** "rentabilidade", "rendimento"

**O que analisa:**
- Total aplicado vs valor atual
- Rentabilidade média da carteira
- Ranking por performance
- Rendimento absoluto (R$) e relativo (%)

**Alertas:**
- ⚠️ Rentabilidade < 5%: Sugestão de diversificação

#### 3.2. Análise de Rebalanceamento

**Palavras-chave:** "rebalance", "diversifica"

**O que analisa:**
- Alocação atual por tipo de ativo
- Percentual de cada classe
- Comparação com alocação ideal

**Alocação Recomendada:**
- Renda Fixa: 40-60% (baixo risco)
- Ações: 20-40% (médio/alto risco)
- Fundos: 10-20% (diversificação)
- Reserva de emergência: 10-15% (liquidez)

#### 3.3. Análise de Liquidez

**Palavras-chave:** "resgate", "liquidez"

**O que analisa:**
- Distribuição por tipo de liquidez
  - Liquidez diária
  - D+1
  - D+30
  - No vencimento
- Percentual de alta liquidez
- Adequação para emergências

**Recomendação:** Manter pelo menos 20% em alta liquidez

#### 3.4. Sugestões de Aportes

**Palavras-chave:** "aporte", "investir"

**O que sugere:**
- Melhor investimento atual (por performance)
- Estratégia de distribuição de aportes
- Prioridades (reserva → renda fixa → renda variável)

**Estratégia Padrão:**
- 40% em renda fixa conservadora
- 30% em ativos de maior rentabilidade
- 20% em diversificação
- 10% para oportunidades

#### 3.5. Análise de Risco

**Palavras-chave:** "risco", "segur"

**Classificação:**
- 🟢 Baixo: CDB, LCI, LCA, Tesouro Direto
- 🟡 Médio: Fundos, Previdência
- 🔴 Alto: Ações

**Alertas:**
- Alto risco > 50%: Sugestão de rebalanceamento
- Baixo risco > 80%: Sugestão de diversificação

### Exemplo de Uso

```typescript
import { InvestimentoAgentService } from './services/investimentoAgentService';

const resposta = await InvestimentoAgentService.chat(mensagens, snapshot);
```

### Casos de Uso Recomendados

1. **Avaliar performance**
   - Pergunta: "Analisar rentabilidade"
   - Resultado: Ranking de investimentos

2. **Rebalancear carteira**
   - Pergunta: "Sugerir rebalanceamento"
   - Resultado: Alocação atual vs ideal

3. **Planejar emergências**
   - Pergunta: "Analisar liquidez"
   - Resultado: Disponibilidade para resgate

4. **Decidir próximo aporte**
   - Pergunta: "Onde investir agora?"
   - Resultado: Estratégia de aporte

## Sistema de Regras IA (AgentRulesService)

### Objetivo
Motor de regras condicionais que avalia automaticamente o estado financeiro e dispara alertas/sugestões.

### Como Funciona

```typescript
interface RegraIA {
  id: string;
  titulo: string;
  condicao: string;        // Ex: "saldo negativo"
  acao: string;            // Ex: "Avisar sobre saldo"
  ativa: boolean;
  tipo: 'alerta' | 'sugestao' | 'automacao';
  prioridade: 'baixa' | 'media' | 'alta';
}
```

### Condições Suportadas

1. **Saldo negativo**: `saldo < 0`
2. **Despesas altas**: `despesas > 80% receitas`
3. **Dívidas altas**: `dívidas > 3x receitas`
4. **Investimentos baixos**: `investimentos < 6x receitas`

### Tipos de Ação

1. **Alerta** (⚠️): Problemas urgentes
2. **Sugestão** (💡): Oportunidades de melhoria
3. **Automação** (🤖): Ações automáticas (futuro)

### Exemplo de Regra

```typescript
{
  titulo: "Alerta de Saldo Negativo",
  condicao: "saldo negativo",
  acao: "Avisar sobre saldo negativo",
  tipo: "alerta",
  prioridade: "alta",
  ativa: true
}
```

**Resultado quando ativada:**
```
⚠️ ALERTA: Seu saldo está negativo em R$ 1.500,00. 
Revise suas despesas urgentemente!
```

## Integrando com IA Real

### OpenAI GPT

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  static async chat(mensagens: MensagemChat[], contexto: PlanilhaData): Promise<string> {
    const systemPrompt = `Você é um assistente financeiro especializado. 
    Contexto: ${JSON.stringify(contexto)}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...mensagens
      ]
    });
    
    return response.choices[0].message.content;
  }
}
```

### Anthropic Claude

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class AIService {
  static async chat(mensagens: MensagemChat[], contexto: PlanilhaData): Promise<string> {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      system: `Assistente financeiro. Contexto: ${JSON.stringify(contexto)}`,
      messages: mensagens
    });
    
    return response.content[0].text;
  }
}
```

## Boas Práticas

1. **Contexto Limitado**: Envie apenas dados necessários para reduzir tokens
2. **Cache de Respostas**: Implemente cache para perguntas frequentes
3. **Fallback**: Mantenha lógica baseada em regras como fallback
4. **Validação**: Sempre valide respostas da IA antes de exibir
5. **Rate Limiting**: Implemente controle de taxa para APIs externas
6. **Custo**: Monitore uso de tokens para controlar custos

## Métricas de Performance

- **Tempo de resposta (simulado)**: < 100ms
- **Tempo de resposta (IA real)**: 1-3s
- **Precisão de análises**: Baseada em cálculos exatos
- **Cobertura de casos de uso**: 80% das perguntas comuns

## Roadmap

- [ ] Integração com GPT-4
- [ ] Fine-tuning com dados financeiros brasileiros
- [ ] Análise de sentimento em descrições
- [ ] Previsão de gastos com ML
- [ ] Categorização automática de transações
- [ ] Alertas proativos por e-mail/push

