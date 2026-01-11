# 🔍 Análise: Isolamento da Área do Mentor por Tenant

**Data**: 11 de Janeiro de 2026  
**Status**: ⚠️ **PROBLEMA CRÍTICO IDENTIFICADO**

---

## 🚨 Resumo Executivo

**A área do mentor NÃO está isolada por tenant (cliente white-label).**

Isso significa que:
- ❌ **Todos os mentores de todos os clientes compartilham o mesmo banco de dados**
- ❌ **Um mentor pode ver alunos de outros clientes white-label**
- ❌ **Não há separação de dados entre clientes**
- ❌ **Violação de privacidade e segurança**

---

## 📋 Evidências Encontradas

### 1. Cloud Function `getAlunos` (mentor.ts)

```typescript
const getAlunos = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    const auth = await getAuthContext(context);
    requireRole(auth, "mentor");

    // Retornar todos os alunos (sem filtro de mentorId)
    const alunosSnapshot = await db
      .collection("alunos")
      .get();

    return alunosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
```

**Problema**: A função retorna **TODOS os alunos** do Firestore, sem filtrar por:
- ❌ `tenantId` (não existe)
- ❌ `mentorId` (comentário diz "sem filtro de mentorId")

### 2. Cloud Function `createAluno` (mentor.ts)

```typescript
// Criar documento do aluno
await db.collection("alunos").doc(userRecord.uid).set({
  userId: userRecord.uid,
  mentorId: auth.uid,
  nome,
  email,
  celular: celular || null,
  plano: plano || null,
  ativo: true,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});
```

**Problema**: Ao criar um aluno, **NÃO é salvo o `tenantId`**, apenas o `mentorId`.

### 3. Estrutura do Firestore

**Coleções principais:**
- `users` - Usuários (alunos, mentores, gestores)
- `alunos` - Dados dos alunos
- `mentores` - Dados dos mentores
- `tenants` - Configurações dos clientes white-label

**Problema**: 
- ❌ Não há campo `tenantId` na coleção `alunos`
- ❌ Não há campo `tenantId` na coleção `mentores`
- ❌ Não há campo `tenantId` na coleção `users`

### 4. Regras de Segurança do Firestore

```javascript
match /alunos/{alunoId} {
  // Mentor pode ler alunos vinculados a ele
  allow read: if hasRole('mentor') && 
                 get(/databases/$(database)/documents/alunos/$(alunoId)).data.mentorId == request.auth.uid;
  
  // Aluno pode ler dados de outros alunos (necessário para o ranking)
  allow read: if hasRole('aluno');
}
```

**Problema**: As regras filtram por `mentorId`, mas **não por `tenantId`**.

---

## 🏗️ Arquitetura Atual

### Como Funciona Hoje

```
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE PROJECT                         │
│                  (plataforma-orbita)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FIRESTORE DATABASE                       │  │
│  │                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   mentores   │  │    alunos    │  │   users    │ │  │
│  │  │              │  │              │  │            │ │  │
│  │  │ mentor1      │  │ aluno1       │  │ user1      │ │  │
│  │  │ mentor2      │  │ aluno2       │  │ user2      │ │  │
│  │  │ mentor3      │  │ aluno3       │  │ user3      │ │  │
│  │  │ ...          │  │ ...          │  │ ...        │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │                                                       │  │
│  │  ❌ SEM ISOLAMENTO POR TENANT                        │  │
│  │  ❌ TODOS OS DADOS COMPARTILHADOS                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

         ↑                    ↑                    ↑
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │ Cliente │          │ Cliente │          │ Cliente │
    │ White-  │          │ Órbita  │          │ White-  │
    │ Label 1 │          │  Free   │          │ Label 2 │
    └─────────┘          └─────────┘          └─────────┘
```

**Todos os clientes compartilham o mesmo banco de dados!**

---

## 🎯 Arquitetura Correta (Multi-Tenant)

### Como Deveria Funcionar

Existem **2 abordagens** para multi-tenancy:

### Opção 1: Database por Tenant (Atual Implementação Parcial)

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  FIREBASE PROJECT 1  │  │  FIREBASE PROJECT 2  │  │  FIREBASE PROJECT 3  │
│  (white-label-1)     │  │  (orbita-free)       │  │  (white-label-2)     │
│                      │  │                      │  │                      │
│  ┌────────────────┐  │  │  ┌────────────────┐  │  │  ┌────────────────┐  │
│  │   FIRESTORE    │  │  │  │   FIRESTORE    │  │  │  │   FIRESTORE    │  │
│  │                │  │  │  │                │  │  │  │                │  │
│  │  mentores      │  │  │  │  mentores      │  │  │  │  mentores      │  │
│  │  alunos        │  │  │  │  alunos        │  │  │  │  alunos        │  │
│  │  users         │  │  │  │  users         │  │  │  │  users         │  │
│  └────────────────┘  │  │  └────────────────┘  │  │  └────────────────┘  │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

✅ **Isolamento total** - Cada cliente tem seu próprio Firebase Project  
✅ **Segurança máxima** - Impossível acessar dados de outros clientes  
❌ **Custo mais alto** - Múltiplos projetos Firebase  
❌ **Complexidade de deploy** - Precisa fazer deploy em cada projeto  

### Opção 2: Database Compartilhado com TenantId (Recomendado)

```
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE PROJECT                         │
│                  (plataforma-orbita)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FIRESTORE DATABASE                       │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │   mentores                                    │    │  │
│  │  │                                               │    │  │
│  │  │ mentor1 { tenantId: "orbita" }                │    │  │
│  │  │ mentor2 { tenantId: "orbita-free" }           │    │  │
│  │  │ mentor3 { tenantId: "white-label-1" }         │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │   alunos                                      │    │  │
│  │  │                                               │    │  │
│  │  │ aluno1 { tenantId: "orbita", mentorId: ... }  │    │  │
│  │  │ aluno2 { tenantId: "orbita-free", ... }       │    │  │
│  │  │ aluno3 { tenantId: "white-label-1", ... }     │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  ✅ ISOLAMENTO POR TENANTID                          │  │
│  │  ✅ FILTROS EM TODAS AS QUERIES                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

✅ **Custo otimizado** - Um único Firebase Project  
✅ **Deploy simplificado** - Deploy único para todos os clientes  
✅ **Isolamento lógico** - Dados separados por `tenantId`  
⚠️ **Requer disciplina** - TODAS as queries devem filtrar por `tenantId`  

---

## 🔧 Correções Necessárias

### 1. Adicionar campo `tenantId` em todas as coleções

**Coleções afetadas:**
- `users`
- `alunos`
- `mentores`
- `gestores`

### 2. Atualizar Cloud Functions

**Funções que precisam ser corrigidas:**

#### `getAlunos` (mentor.ts)
```typescript
// ANTES (ERRADO)
const alunosSnapshot = await db.collection("alunos").get();

// DEPOIS (CORRETO)
const mentorDoc = await db.collection("mentores").doc(auth.uid).get();
const tenantId = mentorDoc.data()?.tenantId;

const alunosSnapshot = await db
  .collection("alunos")
  .where("tenantId", "==", tenantId)
  .where("mentorId", "==", auth.uid)
  .get();
```

#### `createAluno` (mentor.ts)
```typescript
// ANTES (ERRADO)
await db.collection("alunos").doc(userRecord.uid).set({
  userId: userRecord.uid,
  mentorId: auth.uid,
  nome,
  email,
  // ...
});

// DEPOIS (CORRETO)
const mentorDoc = await db.collection("mentores").doc(auth.uid).get();
const tenantId = mentorDoc.data()?.tenantId;

await db.collection("alunos").doc(userRecord.uid).set({
  userId: userRecord.uid,
  mentorId: auth.uid,
  tenantId: tenantId,  // ✅ ADICIONAR
  nome,
  email,
  // ...
});

// Também adicionar tenantId em users
await db.collection("users").doc(userRecord.uid).set({
  uid: userRecord.uid,
  email,
  name: nome,
  role: "aluno",
  tenantId: tenantId,  // ✅ ADICIONAR
  // ...
});
```

### 3. Atualizar Regras de Segurança do Firestore

```javascript
// ANTES (ERRADO)
match /alunos/{alunoId} {
  allow read: if hasRole('mentor') && 
                 get(/databases/$(database)/documents/alunos/$(alunoId)).data.mentorId == request.auth.uid;
}

// DEPOIS (CORRETO)
match /alunos/{alunoId} {
  allow read: if hasRole('mentor') && 
                 get(/databases/$(database)/documents/alunos/$(alunoId)).data.mentorId == request.auth.uid &&
                 get(/databases/$(database)/documents/alunos/$(alunoId)).data.tenantId == getUserData().tenantId;
}
```

### 4. Migração de Dados Existentes

**Script de migração necessário** para adicionar `tenantId` aos documentos existentes:

```typescript
// Pseudo-código
async function migrateData() {
  // 1. Identificar tenant de cada mentor (via domínio ou configuração)
  // 2. Adicionar tenantId em todos os mentores
  // 3. Adicionar tenantId em todos os alunos (baseado no mentorId)
  // 4. Adicionar tenantId em todos os users
}
```

### 5. Atualizar Autenticação

**Adicionar `tenantId` ao token de autenticação:**

```typescript
// Ao fazer login, adicionar custom claim
await admin.auth().setCustomUserClaims(userId, {
  tenantId: userTenantId,
  role: userRole
});
```

---

## 📊 Impacto da Correção

### Funções que Precisam Ser Atualizadas

| Função | Arquivo | Ação |
|--------|---------|------|
| `getAlunos` | mentor.ts | Adicionar filtro `tenantId` |
| `createAluno` | mentor.ts | Adicionar campo `tenantId` |
| `updateAluno` | mentor.ts | Validar `tenantId` |
| `deleteAluno` | mentor.ts | Validar `tenantId` |
| `getAlunoById` | mentor.ts | Validar `tenantId` |
| `getAlunoData` | mentor.ts | Validar `tenantId` |
| `getAlunosMetricas` | mentor.ts | Adicionar filtro `tenantId` |
| Todas as funções de aluno | aluno.ts | Adicionar filtro `tenantId` |

### Páginas que Precisam Ser Testadas

| Página | Arquivo | Teste |
|--------|---------|-------|
| Dashboard Mentor | MentorHome.tsx | Verificar lista de alunos |
| Alunos | MentorAlunos.tsx | Verificar filtro por tenant |
| Visualizar Aluno | MentorViewAluno.tsx | Verificar acesso |
| Conteúdos | MentorPainelGeral.tsx | Verificar isolamento |

---

## ⚠️ Riscos Atuais

### Segurança
- ❌ **Violação de privacidade**: Mentores podem ver alunos de outros clientes
- ❌ **Vazamento de dados**: Dados sensíveis podem ser acessados indevidamente
- ❌ **Conformidade**: Violação de LGPD/GDPR

### Negócio
- ❌ **Perda de confiança**: Clientes white-label podem descobrir o problema
- ❌ **Responsabilidade legal**: Possíveis processos por vazamento de dados
- ❌ **Reputação**: Dano à marca e credibilidade

### Técnico
- ❌ **Dados misturados**: Difícil identificar qual aluno pertence a qual cliente
- ❌ **Migração complexa**: Quanto mais dados, mais difícil corrigir

---

## 🎯 Recomendações

### Prioridade CRÍTICA

1. **PARAR de adicionar novos clientes white-label** até corrigir o problema
2. **Implementar isolamento por `tenantId`** IMEDIATAMENTE
3. **Migrar dados existentes** para adicionar `tenantId`
4. **Testar exaustivamente** antes de voltar a adicionar clientes

### Abordagem Recomendada

**Opção 2: Database Compartilhado com TenantId**

Motivos:
- ✅ Mais econômico (um único Firebase Project)
- ✅ Deploy simplificado
- ✅ Já existe a coleção `tenants`
- ✅ Alinha com a arquitetura atual

---

## 📝 Próximos Passos

1. ✅ **Análise completa** (este documento)
2. ⏳ **Aprovação do usuário** para implementar correções
3. ⏳ **Implementar correções** em Cloud Functions
4. ⏳ **Atualizar regras de segurança** do Firestore
5. ⏳ **Migrar dados existentes** (script de migração)
6. ⏳ **Testar isolamento** em ambiente de produção
7. ⏳ **Documentar** processo e boas práticas

---

## 💰 Estimativa de Esforço

| Tarefa | Tempo Estimado |
|--------|----------------|
| Atualizar Cloud Functions | 2-3 horas |
| Atualizar regras Firestore | 1 hora |
| Script de migração de dados | 2 horas |
| Testes | 2-3 horas |
| Deploy e validação | 1 hora |
| **TOTAL** | **8-10 horas** |

---

## ✅ Conclusão

A Plataforma Órbita **NÃO está isolando dados por tenant** na área do mentor. Isso representa um **risco crítico de segurança e privacidade**.

**Ação recomendada**: Implementar isolamento por `tenantId` IMEDIATAMENTE antes de adicionar mais clientes white-label.

---

**Documento criado por**: Manus AI  
**Data**: 11 de Janeiro de 2026
