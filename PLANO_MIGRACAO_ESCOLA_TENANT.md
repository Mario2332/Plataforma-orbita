# 🚀 Plano de Migração: Mentor → Escola + Isolamento por Tenant

**Data**: 11 de Janeiro de 2026  
**Objetivo**: Implementar isolamento por tenant e renomear Mentor → Escola

---

## 📋 Estratégia de Migração

### Fase 1: Preparação
- ✅ Análise completa da estrutura atual
- ✅ Identificação de todos os pontos de mudança
- ⏳ Backup de dados (via export do Firestore)
- ⏳ Criação de branch no Git

### Fase 2: Backend (Cloud Functions + Firestore)
1. Renomear coleção `mentores` → `escolas`
2. Adicionar campo `tenantId` em todas as coleções
3. Atualizar Cloud Functions com isolamento
4. Atualizar regras de segurança

### Fase 3: Frontend
1. Renomear arquivos e pastas
2. Atualizar componentes e páginas
3. Atualizar rotas
4. Atualizar textos da interface

### Fase 4: Migração de Dados
1. Script para adicionar `tenantId` aos dados existentes
2. Script para renomear documentos de mentor → escola
3. Validação de integridade

### Fase 5: Deploy e Testes
1. Deploy das Cloud Functions
2. Deploy das regras de segurança
3. Deploy do frontend
4. Testes de isolamento

---

## 🗂️ Mapeamento de Mudanças

### Coleções Firestore

| Antes | Depois | Ação |
|-------|--------|------|
| `mentores` | `escolas` | Renomear coleção |
| `mentores/{id}/anotacoes` | `escolas/{id}/anotacoes` | Renomear subcoleção |

### Campos

| Coleção | Campo Antes | Campo Depois |
|---------|-------------|--------------|
| `alunos` | `mentorId` | `escolaId` |
| `users` | `role: "mentor"` | `role: "escola"` |

### Novos Campos (tenantId)

| Coleção | Novo Campo |
|---------|------------|
| `users` | `tenantId` |
| `alunos` | `tenantId` |
| `escolas` | `tenantId` |
| `gestores` | `tenantId` |

---

## 📁 Arquivos a Serem Modificados

### Cloud Functions (Backend)

| Arquivo | Mudanças |
|---------|----------|
| `functions/src/callable/mentor.ts` | Renomear para `escola.ts`, adicionar filtros `tenantId` |
| `functions/src/callable/mentor-conteudos.ts` | Renomear para `escola-conteudos.ts` |
| `functions/src/index.ts` | Atualizar exports |
| `functions/src/utils/auth.ts` | Adicionar validação de `tenantId` |

### Frontend (Client)

| Arquivo | Mudanças |
|---------|----------|
| `client/src/pages/mentor/*` | Renomear pasta para `escola/*` |
| `client/src/pages/auth/LoginMentor.tsx` | Renomear para `LoginEscola.tsx` |
| `client/src/pages/gestor/GestorMentores.tsx` | Renomear para `GestorEscolas.tsx` |
| `client/src/lib/api.ts` | Renomear `mentorApi` → `escolaApi` |
| `client/src/lib/api-mentor-conteudos.ts` | Renomear para `api-escola-conteudos.ts` |
| `client/src/lib/cachedApi.ts` | Renomear `cachedMentorApi` → `cachedEscolaApi` |
| `client/src/contexts/AuthContext.tsx` | Atualizar role "mentor" → "escola" |
| `client/src/App.tsx` | Atualizar rotas |

### Regras de Segurança

| Arquivo | Mudanças |
|---------|----------|
| `firestore.rules` | Adicionar validação `tenantId`, renomear mentor → escola |

---

## 🔧 Implementação Detalhada

### 1. Cloud Functions - Isolamento por Tenant

**Padrão de implementação:**

```typescript
// ANTES
const getAlunos = async (data, context) => {
  const auth = await getAuthContext(context);
  requireRole(auth, "mentor");
  
  const alunos = await db.collection("alunos").get();
  return alunos.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// DEPOIS
const getAlunos = async (data, context) => {
  const auth = await getAuthContext(context);
  requireRole(auth, "escola");
  
  // Obter tenantId da escola
  const escolaDoc = await db.collection("escolas").doc(auth.uid).get();
  if (!escolaDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Escola não encontrada");
  }
  
  const tenantId = escolaDoc.data()!.tenantId;
  
  // Filtrar por tenantId E escolaId
  const alunos = await db
    .collection("alunos")
    .where("tenantId", "==", tenantId)
    .where("escolaId", "==", auth.uid)
    .get();
    
  return alunos.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### 2. Regras de Segurança - Validação de Tenant

```javascript
// Função auxiliar para obter tenantId do usuário
function getUserTenantId() {
  return getUserData().tenantId;
}

// Validar acesso a alunos
match /alunos/{alunoId} {
  allow read: if hasRole('escola') && 
                 resource.data.escolaId == request.auth.uid &&
                 resource.data.tenantId == getUserTenantId();
}
```

### 3. Frontend - Atualização de API

```typescript
// ANTES
import { mentorApi } from "@/lib/api";
const alunos = await mentorApi.getAlunos();

// DEPOIS
import { escolaApi } from "@/lib/api";
const alunos = await escolaApi.getAlunos();
```

---

## 🔄 Script de Migração de Dados

### Objetivos:
1. Adicionar `tenantId` a todos os documentos
2. Renomear campo `mentorId` → `escolaId`
3. Renomear coleção `mentores` → `escolas`
4. Atualizar role "mentor" → "escola"

### Estratégia:
- Usar Firebase Admin SDK
- Processar em lotes (batch writes)
- Manter backup antes de executar
- Validar integridade após migração

---

## ✅ Checklist de Implementação

### Backend
- [ ] Renomear `mentor.ts` → `escola.ts`
- [ ] Renomear `mentor-conteudos.ts` → `escola-conteudos.ts`
- [ ] Adicionar filtros `tenantId` em todas as queries
- [ ] Atualizar criação de documentos com `tenantId`
- [ ] Atualizar validações de acesso
- [ ] Atualizar exports no `index.ts`

### Regras de Segurança
- [ ] Adicionar função `getUserTenantId()`
- [ ] Atualizar regras de `alunos` com `tenantId`
- [ ] Atualizar regras de `escolas` (antes mentores)
- [ ] Validar isolamento por tenant

### Frontend - Arquivos
- [ ] Renomear pasta `mentor/` → `escola/`
- [ ] Renomear `LoginMentor.tsx` → `LoginEscola.tsx`
- [ ] Renomear `GestorMentores.tsx` → `GestorEscolas.tsx`
- [ ] Renomear `api-mentor-conteudos.ts` → `api-escola-conteudos.ts`
- [ ] Atualizar `api.ts` (mentorApi → escolaApi)
- [ ] Atualizar `cachedApi.ts`
- [ ] Atualizar rotas no `App.tsx`

### Frontend - Textos
- [ ] Substituir "Mentor" → "Escola" em todos os textos
- [ ] Atualizar títulos de páginas
- [ ] Atualizar breadcrumbs
- [ ] Atualizar mensagens de toast

### Migração de Dados
- [ ] Criar script de migração
- [ ] Testar em ambiente local
- [ ] Executar em produção
- [ ] Validar integridade

### Deploy
- [ ] Deploy Cloud Functions
- [ ] Deploy Firestore Rules
- [ ] Deploy Frontend
- [ ] Testar isolamento

---

## 🎯 Ordem de Execução

1. **Git**: Criar branch `feature/escola-tenant-isolation`
2. **Backend**: Atualizar Cloud Functions
3. **Rules**: Atualizar regras de segurança
4. **Frontend**: Renomear e atualizar código
5. **Migration**: Executar script de migração
6. **Deploy**: Fazer deploy completo
7. **Test**: Validar isolamento
8. **Merge**: Fazer merge na main

---

## 📊 Estimativa de Tempo

| Fase | Tempo |
|------|-------|
| Backup e preparação | 30min |
| Cloud Functions | 2h |
| Regras de segurança | 1h |
| Frontend (arquivos) | 2h |
| Frontend (textos) | 1h |
| Script de migração | 2h |
| Deploy e testes | 2h |
| **TOTAL** | **10-11h** |

---

**Status**: Pronto para execução ✅
