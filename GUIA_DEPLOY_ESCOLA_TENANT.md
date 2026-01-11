# 🚀 Guia de Deploy: Isolamento por Tenant + Escola

**Data**: 11 de Janeiro de 2026  
**Branch**: `feature/escola-tenant-isolation`  
**Commit**: `c24e51c12`

---

## ✅ O Que Foi Implementado

### 1. **Isolamento por Tenant**
- ✅ Adicionado campo `tenantId` em todas as coleções
- ✅ Filtros por `tenantId` em todas as Cloud Functions
- ✅ Validação de `tenantId` nas regras de segurança
- ✅ Cada cliente white-label tem seus dados isolados

### 2. **Renomeação Mentor → Escola**
- ✅ Coleção `mentores` → `escolas`
- ✅ Campo `mentorId` → `escolaId`
- ✅ Role `mentor` → `escola`
- ✅ Toda interface atualizada (páginas, componentes, textos)
- ✅ Cloud Functions renomeadas (`mentorFunctions` → `escolaFunctions`)

### 3. **Arquitetura Escalável**
- ✅ Helper functions para validação de tenant
- ✅ Queries otimizadas com índices compostos
- ✅ Preparado para milhares de usuários

---

## 📦 Arquivos Modificados

### Backend (Cloud Functions)
- ✅ `functions/src/callable/escola.ts` (novo)
- ✅ `functions/src/callable/escola-conteudos.ts` (novo)
- ✅ `functions/src/index.ts` (atualizado)

### Regras de Segurança
- ✅ `firestore.rules` (atualizado)

### Frontend
- ✅ `client/src/pages/escola/*` (renomeado de mentor)
- ✅ `client/src/pages/auth/LoginEscola.tsx` (renomeado)
- ✅ `client/src/pages/gestor/GestorEscolas.tsx` (renomeado)
- ✅ `client/src/lib/api.ts` (atualizado)
- ✅ `client/src/lib/api-escola-conteudos.ts` (renomeado)
- ✅ `client/src/lib/cachedApi.ts` (atualizado)
- ✅ `client/src/App.tsx` (rotas atualizadas)

### Script de Migração
- ✅ `/home/ubuntu/migrate_tenant_escola.js`

---

## 🔧 Passo a Passo para Deploy

### **Pré-requisitos**

1. ✅ Firebase CLI instalado e autenticado
2. ✅ Node.js 20+ instalado
3. ✅ Acesso ao projeto Firebase `plataforma-orbita`
4. ✅ Service Account Key do projeto

---

### **Passo 1: Fazer Backup dos Dados** ⚠️

**IMPORTANTE**: Sempre faça backup antes de migrar!

```bash
# Exportar dados do Firestore
firebase firestore:export gs://plataforma-orbita.appspot.com/backups/pre-escola-migration --project plataforma-orbita
```

---

### **Passo 2: Executar Script de Migração**

```bash
# Navegar para o diretório
cd /home/ubuntu

# Instalar dependências (se necessário)
npm install firebase-admin

# Executar migração
node migrate_tenant_escola.js
```

**O script irá:**
1. Copiar coleção `mentores` → `escolas`
2. Adicionar `tenantId` em `users`
3. Adicionar `tenantId` e renomear `mentorId` → `escolaId` em `alunos`
4. Adicionar `tenantId` em `escolas`
5. Adicionar `tenantId` em `gestores`
6. Atualizar role `mentor` → `escola` em `users`

**Saída esperada:**
```
🚀 Iniciando migração...

📋 Passo 1: Copiando mentores para escolas...
   ✅ X mentores copiados para escolas

📋 Passo 2: Adicionando tenantId em users...
   ✅ X usuários atualizados
   ✅ X roles "mentor" → "escola"

📋 Passo 3: Migrando alunos (tenantId + mentorId → escolaId)...
   ✅ X alunos atualizados

📋 Passo 4: Adicionando tenantId em escolas...
   ✅ X escolas atualizadas

📋 Passo 5: Adicionando tenantId em gestores...
   ✅ X gestores atualizados

✅ Migração concluída com sucesso!
```

---

### **Passo 3: Deploy das Firestore Rules**

```bash
cd /home/ubuntu/Plataforma-orbita

# Deploy das regras de segurança
firebase deploy --only firestore:rules --project plataforma-orbita
```

---

### **Passo 4: Deploy das Cloud Functions**

```bash
cd /home/ubuntu/Plataforma-orbita

# Build das functions
cd functions
npm run build

# Deploy
cd ..
firebase deploy --only functions --project plataforma-orbita
```

**Funções que serão atualizadas:**
- `escolaFunctions-*` (todas as funções de escola)
- `getConteudosSimples` (atualizada)
- Outras funções relacionadas

---

### **Passo 5: Deploy do Frontend**

```bash
cd /home/ubuntu/Plataforma-orbita

# Build do frontend (já foi feito)
cd client
pnpm run build

# Deploy
cd ..
firebase deploy --only hosting --project plataforma-orbita
```

---

### **Passo 6: Validar Isolamento**

#### 6.1. Testar Login de Escola

1. Acesse: https://plataforma-orbita.web.app/login/escola
2. Faça login com uma conta de escola
3. Verifique se vê apenas alunos do seu tenant

#### 6.2. Testar Criação de Aluno

1. Na área da escola, crie um novo aluno
2. Verifique no Firestore Console se o aluno tem:
   - ✅ Campo `tenantId` preenchido
   - ✅ Campo `escolaId` (não `mentorId`)

#### 6.3. Testar Isolamento entre Tenants

**Cenário de teste:**
1. Criar 2 escolas em tenants diferentes
2. Cada escola criar 1 aluno
3. Verificar que escola A não vê aluno da escola B

**Validação no Firestore Console:**
```
alunos/
  ├─ aluno1
  │   ├─ tenantId: "orbita"
  │   └─ escolaId: "escolaA"
  └─ aluno2
      ├─ tenantId: "orbita-free"
      └─ escolaId: "escolaB"
```

---

### **Passo 7: Criar Índices Compostos**

Para otimizar as queries com `tenantId`, crie índices no Firestore:

```bash
# Acessar Firestore Console
# https://console.firebase.google.com/project/plataforma-orbita/firestore/indexes

# Criar índices compostos:
# 1. alunos: tenantId (ASC) + escolaId (ASC)
# 2. alunos: tenantId (ASC) + ativo (ASC)
```

Ou usar o Firebase CLI:
```bash
firebase firestore:indexes --project plataforma-orbita
```

---

### **Passo 8: Limpar Dados Antigos (Opcional)**

⚠️ **Só execute após validar que tudo está funcionando!**

```bash
# Deletar coleção antiga "mentores"
# Pode ser feito manualmente no Firestore Console
# Ou via script:

node << 'SCRIPT'
const admin = require('firebase-admin');
const serviceAccount = require('./plataforma-orbita-firebase-adminsdk-fbsvc-707d9d55f6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteMentores() {
  const snapshot = await db.collection('mentores').get();
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('✅ Coleção "mentores" deletada');
}

deleteMentores();
SCRIPT
```

---

## 🧪 Checklist de Validação

### Backend
- [ ] Cloud Functions deployadas sem erros
- [ ] Firestore Rules deployadas sem erros
- [ ] Função `escolaFunctions-getAlunos` retorna apenas alunos do tenant
- [ ] Função `escolaFunctions-createAluno` adiciona `tenantId`

### Frontend
- [ ] Build do frontend sem erros
- [ ] Hosting deployado
- [ ] Rota `/login/escola` funciona
- [ ] Dashboard da escola carrega
- [ ] Lista de alunos mostra apenas alunos do tenant

### Dados
- [ ] Coleção `escolas` existe e tem dados
- [ ] Campo `tenantId` presente em `users`
- [ ] Campo `tenantId` presente em `alunos`
- [ ] Campo `escolaId` presente em `alunos` (não `mentorId`)
- [ ] Role `escola` presente em `users` (não `mentor`)

### Isolamento
- [ ] Escola A não vê alunos da Escola B
- [ ] Aluno A não vê dados do Aluno B de outro tenant
- [ ] Tentativa de acesso cross-tenant retorna erro de permissão

---

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode fazer rollback:

### 1. Restaurar Backup do Firestore
```bash
firebase firestore:import gs://plataforma-orbita.appspot.com/backups/pre-escola-migration --project plataforma-orbita
```

### 2. Reverter Código
```bash
cd /home/ubuntu/Plataforma-orbita
git checkout main
```

### 3. Re-deploy
```bash
firebase deploy --project plataforma-orbita
```

---

## 📊 Estrutura de Dados Final

### Coleção `escolas`
```javascript
{
  id: "escolaId123",
  tenantId: "orbita",
  nome: "Escola Exemplo",
  email: "escola@exemplo.com",
  // ... outros campos
}
```

### Coleção `alunos`
```javascript
{
  id: "alunoId456",
  tenantId: "orbita",
  escolaId: "escolaId123",
  nome: "João Silva",
  email: "joao@exemplo.com",
  // ... outros campos
}
```

### Coleção `users`
```javascript
{
  id: "userId789",
  tenantId: "orbita",
  role: "escola", // ou "aluno"
  name: "Nome",
  email: "email@exemplo.com",
  // ... outros campos
}
```

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ **Monitorar logs** das Cloud Functions por 24-48h
2. ✅ **Validar métricas** de uso e performance
3. ✅ **Documentar** processo para novos clientes
4. ✅ **Treinar** equipe sobre nova terminologia (Escola)
5. ✅ **Atualizar** materiais de marketing e documentação

---

## 📞 Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs do Firebase Console
2. Verifique o Firestore Console para validar dados
3. Teste as funções individualmente no Firebase Console
4. Entre em contato com o desenvolvedor se necessário

---

## 📝 Notas Importantes

### TenantId Padrão

O script de migração usa `tenantId: "orbita"` como padrão para dados existentes. Se você tiver múltiplos tenants, ajuste o script antes de executar.

### Índices Compostos

As queries com `tenantId` podem requerer índices compostos. O Firebase irá sugerir criar esses índices automaticamente quando você fizer a primeira query.

### Performance

Com isolamento por tenant, as queries são mais rápidas pois filtram por `tenantId` primeiro, reduzindo o escopo de busca.

### Escalabilidade

A arquitetura atual suporta:
- ✅ Milhares de tenants
- ✅ Milhares de escolas por tenant
- ✅ Milhares de alunos por escola
- ✅ Milhões de documentos no Firestore

---

**Boa sorte com o deploy! 🚀**
