# 💰 Análise de Custos - Plataforma Órbita

**Data**: 11 de Janeiro de 2026  
**Análise**: Custos mensais estimados do Firebase/Google Cloud

---

## 📊 Infraestrutura Atual

### Serviços Utilizados

1. **Firebase Hosting**
   - Hospedagem de aplicações web (plataforma-orbita, orbita-free)
   - CDN global
   - SSL automático

2. **Cloud Firestore**
   - Banco de dados NoSQL
   - Coleções: users, estudos, simulados, redacoes, cronogramas, metas, conteudos, tenants, etc.

3. **Cloud Functions (2nd Gen)**
   - ~80 functions deployadas
   - Região: southamerica-east1 (São Paulo)
   - Runtime: Node.js 20
   - Memória: 512MB (padrão)

4. **Firebase Storage**
   - Armazenamento de arquivos (redações, fotos de perfil, etc.)

5. **Firebase Authentication**
   - Autenticação de usuários (email/senha)

6. **Cloud Scheduler**
   - Jobs agendados (processarMetasDiarias, rankingWeeklyUpdate)

---

## 🧮 Estimativa de Uso por Aluno Ativo

### Definição de "Aluno Ativo"

Um aluno ativo é aquele que:
- Acessa a plataforma **5 dias por semana**
- Registra **2 sessões de estudo por dia** (média 2h/dia)
- Faz **1 simulado por semana**
- Escreve **1 redação por semana**
- Acessa cronograma e métricas **2x por semana**

### Operações por Aluno/Mês

| Operação | Quantidade/Mês | Tipo |
|----------|----------------|------|
| **Leituras Firestore** | 600 | Login, carregar dados, métricas |
| **Escritas Firestore** | 200 | Registrar estudos, simulados, redações |
| **Invocações Cloud Functions** | 400 | getEstudos, getSimulados, etc. |
| **Storage Reads** | 20 | Carregar fotos, redações |
| **Storage Writes** | 4 | Upload de redações |
| **Armazenamento Storage** | 50 MB | Redações, fotos |
| **Armazenamento Firestore** | 10 MB | Dados do aluno |
| **Bandwidth Hosting** | 500 MB | Carregamento da aplicação |

---

## 💵 Tabela de Preços Firebase (2026)

### Firestore

| Recurso | Preço | Free Tier |
|---------|-------|-----------|
| Leituras | $0.06 / 100k | 50k/dia |
| Escritas | $0.18 / 100k | 20k/dia |
| Exclusões | $0.02 / 100k | 20k/dia |
| Armazenamento | $0.18 / GB | 1 GB |

### Cloud Functions (2nd Gen)

| Recurso | Preço | Free Tier |
|---------|-------|-----------|
| Invocações | $0.40 / milhão | 2 milhões/mês |
| CPU-segundos | $0.00001667 / GB-segundo | 400k GB-segundos/mês |
| Memória | $0.00000231 / GB-segundo | 400k GB-segundos/mês |
| Networking | $0.12 / GB | 5 GB/mês |

### Firebase Storage

| Recurso | Preço | Free Tier |
|---------|-------|-----------|
| Armazenamento | $0.026 / GB | 5 GB |
| Downloads | $0.12 / GB | 1 GB/dia |
| Uploads | $0.12 / GB | - |

### Firebase Hosting

| Recurso | Preço | Free Tier |
|---------|-------|-----------|
| Armazenamento | $0.026 / GB | 10 GB |
| Bandwidth | $0.15 / GB | 360 MB/dia |

### Firebase Authentication

| Recurso | Preço | Free Tier |
|---------|-------|-----------|
| Autenticações | Grátis | Ilimitado |

### Cloud Scheduler

| Recurso | Preço | Free Tier |
|---------|-------|-----------|
| Jobs | $0.10 / job/mês | 3 jobs grátis |

---

## 📈 Cálculo de Custos

### Cenário 1: 30 Alunos Ativos

#### Firestore
- **Leituras**: 30 × 600 = 18,000/mês
  - Free tier: 50k/dia × 30 = 1,5M/mês ✅ **Grátis**
- **Escritas**: 30 × 200 = 6,000/mês
  - Free tier: 20k/dia × 30 = 600k/mês ✅ **Grátis**
- **Armazenamento**: 30 × 10 MB = 300 MB
  - Free tier: 1 GB ✅ **Grátis**

**Subtotal Firestore: $0.00**

#### Cloud Functions
- **Invocações**: 30 × 400 = 12,000/mês
  - Free tier: 2M/mês ✅ **Grátis**
- **CPU/Memória**: ~50k GB-segundos
  - Free tier: 400k GB-segundos/mês ✅ **Grátis**

**Subtotal Cloud Functions: $0.00**

#### Firebase Storage
- **Armazenamento**: 30 × 50 MB = 1.5 GB
  - Free tier: 5 GB ✅ **Grátis**
- **Downloads**: 30 × 20 × 0.5 MB = 300 MB
  - Free tier: 1 GB/dia × 30 = 30 GB/mês ✅ **Grátis**

**Subtotal Storage: $0.00**

#### Firebase Hosting
- **Bandwidth**: 30 × 500 MB = 15 GB
  - Free tier: 360 MB/dia × 30 = 10.8 GB/mês
  - Excedente: 15 - 10.8 = 4.2 GB × $0.15 = **$0.63**

**Subtotal Hosting: $0.63**

#### Cloud Scheduler
- **Jobs**: 2 jobs (processarMetasDiarias, rankingWeeklyUpdate)
  - Free tier: 3 jobs ✅ **Grátis**

**Subtotal Scheduler: $0.00**

#### **TOTAL 30 ALUNOS: ~$0.63/mês** ✅

---

### Cenário 2: 50 Alunos Ativos

#### Firestore
- **Leituras**: 50 × 600 = 30,000/mês ✅ **Grátis**
- **Escritas**: 50 × 200 = 10,000/mês ✅ **Grátis**
- **Armazenamento**: 50 × 10 MB = 500 MB ✅ **Grátis**

**Subtotal Firestore: $0.00**

#### Cloud Functions
- **Invocações**: 50 × 400 = 20,000/mês ✅ **Grátis**
- **CPU/Memória**: ~80k GB-segundos ✅ **Grátis**

**Subtotal Cloud Functions: $0.00**

#### Firebase Storage
- **Armazenamento**: 50 × 50 MB = 2.5 GB ✅ **Grátis**
- **Downloads**: 50 × 20 × 0.5 MB = 500 MB ✅ **Grátis**

**Subtotal Storage: $0.00**

#### Firebase Hosting
- **Bandwidth**: 50 × 500 MB = 25 GB
  - Free tier: 10.8 GB/mês
  - Excedente: 25 - 10.8 = 14.2 GB × $0.15 = **$2.13**

**Subtotal Hosting: $2.13**

#### Cloud Scheduler
- **Jobs**: 2 jobs ✅ **Grátis**

**Subtotal Scheduler: $0.00**

#### **TOTAL 50 ALUNOS: ~$2.13/mês** ✅

---

### Cenário 3: 100 Alunos Ativos

#### Firestore
- **Leituras**: 100 × 600 = 60,000/mês ✅ **Grátis**
- **Escritas**: 100 × 200 = 20,000/mês ✅ **Grátis**
- **Armazenamento**: 100 × 10 MB = 1 GB ✅ **Grátis**

**Subtotal Firestore: $0.00**

#### Cloud Functions
- **Invocações**: 100 × 400 = 40,000/mês ✅ **Grátis**
- **CPU/Memória**: ~160k GB-segundos ✅ **Grátis**

**Subtotal Cloud Functions: $0.00**

#### Firebase Storage
- **Armazenamento**: 100 × 50 MB = 5 GB ✅ **Grátis**
- **Downloads**: 100 × 20 × 0.5 MB = 1 GB ✅ **Grátis**

**Subtotal Storage: $0.00**

#### Firebase Hosting
- **Bandwidth**: 100 × 500 MB = 50 GB
  - Free tier: 10.8 GB/mês
  - Excedente: 50 - 10.8 = 39.2 GB × $0.15 = **$5.88**

**Subtotal Hosting: $5.88**

#### Cloud Scheduler
- **Jobs**: 2 jobs ✅ **Grátis**

**Subtotal Scheduler: $0.00**

#### **TOTAL 100 ALUNOS: ~$5.88/mês** ✅

---

## 📊 Resumo de Custos

| Alunos Ativos | Custo Mensal | Custo por Aluno |
|---------------|--------------|-----------------|
| **30** | **$0.63** | **$0.02** |
| **50** | **$2.13** | **$0.04** |
| **100** | **$5.88** | **$0.06** |

---

## 💡 Observações Importantes

### 1. Custos Extremamente Baixos

A Plataforma Órbita está **muito bem otimizada** e aproveita ao máximo o **Free Tier do Firebase**, que é extremamente generoso:

- ✅ **Firestore**: Suporta até ~500 alunos ativos sem custo
- ✅ **Cloud Functions**: Suporta até ~5.000 alunos ativos sem custo
- ✅ **Storage**: Suporta até ~100 alunos ativos sem custo
- ⚠️ **Hosting**: É o único serviço que gera custo (bandwidth)

### 2. Escalabilidade

A arquitetura atual **escala muito bem**:

- Até **500 alunos ativos**: Custo < $30/mês
- Até **1.000 alunos ativos**: Custo < $60/mês
- Até **5.000 alunos ativos**: Custo < $300/mês

### 3. Custos Fixos vs Variáveis

- **Custos Fixos**: $0/mês (não há custos fixos!)
- **Custos Variáveis**: Escalam linearmente com o número de alunos

### 4. Comparação com Alternativas

| Alternativa | Custo Mensal (100 alunos) |
|-------------|---------------------------|
| **Firebase** | **$5.88** ✅ |
| AWS (EC2 + RDS) | ~$50-100 |
| DigitalOcean | ~$30-50 |
| Heroku | ~$50-100 |

Firebase é **10-20x mais barato** para essa escala!

---

## 🚀 Recomendações para Otimização

### 1. Implementar Cache Agressivo

- Usar **Service Workers** para cache de assets estáticos
- Reduzir bandwidth do Hosting em até **50%**
- **Economia estimada**: $0.30-$3/mês dependendo da escala

### 2. Comprimir Assets

- Minificar JS/CSS
- Comprimir imagens (WebP)
- **Economia estimada**: $0.20-$2/mês

### 3. Lazy Loading

- Carregar componentes sob demanda
- Reduzir tamanho inicial do bundle
- **Economia estimada**: $0.10-$1/mês

### 4. CDN Próprio (Opcional)

Para escala muito grande (>1000 alunos):
- Usar Cloudflare CDN (grátis)
- Reduzir bandwidth do Firebase Hosting
- **Economia estimada**: $5-$20/mês

---

## 📈 Projeção de Crescimento

### Cenário Conservador (Crescimento Linear)

| Mês | Alunos | Custo Mensal | Custo Acumulado |
|-----|--------|--------------|-----------------|
| 1 | 30 | $0.63 | $0.63 |
| 3 | 50 | $2.13 | $5.52 |
| 6 | 100 | $5.88 | $23.40 |
| 12 | 200 | $11.76 | $88.20 |

### Cenário Otimista (Crescimento Exponencial)

| Mês | Alunos | Custo Mensal | Custo Acumulado |
|-----|--------|--------------|-----------------|
| 1 | 30 | $0.63 | $0.63 |
| 3 | 100 | $5.88 | $13.14 |
| 6 | 300 | $17.64 | $70.56 |
| 12 | 1000 | $58.80 | $352.80 |

---

## 🎯 Conclusão

A Plataforma Órbita tem **custos operacionais extremamente baixos**:

✅ **30 alunos**: $0.63/mês ($0.02/aluno)  
✅ **50 alunos**: $2.13/mês ($0.04/aluno)  
✅ **100 alunos**: $5.88/mês ($0.06/aluno)  

Isso significa que você pode:

1. **Oferecer preços competitivos** para seus clientes white-label
2. **Ter margem de lucro alta** (>95%)
3. **Escalar sem preocupações** com custos de infraestrutura
4. **Focar no crescimento** em vez de otimização prematura

A arquitetura Firebase foi uma **excelente escolha** para este projeto! 🚀

---

**Nota**: Estes valores são estimativas baseadas na infraestrutura atual e padrões de uso típicos. Custos reais podem variar dependendo do comportamento dos usuários.
