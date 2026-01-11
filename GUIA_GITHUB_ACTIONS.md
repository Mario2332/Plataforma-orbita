# 🚀 Guia de Configuração: Deploy Automatizado via GitHub Actions

Este guia explica como configurar o deploy automatizado da Plataforma Órbita usando GitHub Actions.

---

## 📋 O Que Foi Configurado

Criei um workflow do GitHub Actions que fará deploy automaticamente sempre que você fizer push para as branches:
- `main`
- `feature/escola-tenant-isolation`

O workflow também pode ser executado manualmente a qualquer momento.

---

## 🔧 Configuração Necessária (Uma Única Vez)

### Passo 1: Adicionar a Chave de Serviço como Secret

1. **Acesse o repositório no GitHub**:
   - https://github.com/Mario2332/Plataforma-orbita

2. **Vá para Settings → Secrets and variables → Actions**

3. **Clique em "New repository secret"**

4. **Crie o secret `FIREBASE_SERVICE_ACCOUNT`**:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Cole o conteúdo completo do arquivo `plataforma-orbita-firebase-adminsdk-fbsvc-8ba3d7ee46.json`
   
   ```json
   {
     "type": "service_account",
     "project_id": "plataforma-orbita",
     "private_key_id": "8ba3d7ee46633e734968c33b93c2123c027b8f37",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "firebase-adminsdk-fbsvc@plataforma-orbita.iam.gserviceaccount.com",
     ...
   }
   ```

5. **Clique em "Add secret"**

---

## 🎯 Como Usar

### Deploy Automático (Recomendado)

Simplesmente faça push para o repositório:

```bash
git push origin feature/escola-tenant-isolation
```

O GitHub Actions irá:
1. ✅ Fazer build do frontend
2. ✅ Fazer build das Cloud Functions
3. ✅ Deploy das Firestore Rules
4. ✅ Deploy das Cloud Functions
5. ✅ Deploy do Frontend (Hosting)

### Deploy Manual

1. Acesse: https://github.com/Mario2332/Plataforma-orbita/actions
2. Clique em "Deploy para Firebase" (workflow)
3. Clique em "Run workflow"
4. Selecione a branch
5. Clique em "Run workflow"

---

## 📊 Monitorar o Deploy

1. **Acesse a aba Actions**:
   - https://github.com/Mario2332/Plataforma-orbita/actions

2. **Veja o progresso em tempo real**:
   - Cada etapa do deploy será mostrada
   - Logs completos disponíveis
   - Notificação de sucesso/erro

3. **Verificar o resultado**:
   - ✅ Frontend: https://plataforma-orbita.web.app
   - ✅ Cloud Functions: Firebase Console
   - ✅ Firestore Rules: Firebase Console

---

## 🔍 Troubleshooting

### Erro: "Secret FIREBASE_SERVICE_ACCOUNT not found"

**Solução**: Adicione o secret conforme o Passo 1 acima.

### Erro: "Permission denied"

**Solução**: Verifique se a chave de serviço tem as permissões necessárias:
- Firebase Admin
- Cloud Functions Admin
- Firestore Admin

### Erro no Build

**Solução**: Verifique os logs no GitHub Actions para identificar o erro específico.

---

## 📝 Estrutura do Workflow

O arquivo `.github/workflows/deploy.yml` contém:

```yaml
name: Deploy para Firebase

on:
  push:
    branches:
      - main
      - feature/escola-tenant-isolation
  workflow_dispatch: # Permite executar manualmente

jobs:
  deploy:
    name: Deploy Completo
    runs-on: ubuntu-latest
    
    steps:
      - Checkout do código
      - Configurar Node.js
      - Instalar dependências
      - Build do Frontend
      - Build das Cloud Functions
      - Configurar credenciais do Firebase
      - Deploy das Firestore Rules
      - Deploy das Cloud Functions
      - Deploy do Frontend (Hosting)
```

---

## ✅ Vantagens do GitHub Actions

1. **Sem comandos manuais** - Tudo automatizado
2. **Deploy consistente** - Sempre o mesmo processo
3. **Histórico completo** - Todos os deploys registrados
4. **Rollback fácil** - Basta fazer push de um commit anterior
5. **Notificações** - Email/Slack quando deploy completa

---

## 🎉 Próximos Passos

1. ✅ **Configurar o secret** no GitHub (uma única vez)
2. ✅ **Fazer push** da branch `feature/escola-tenant-isolation`
3. ✅ **Monitorar** o deploy no GitHub Actions
4. ✅ **Validar** que tudo funcionou

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no GitHub Actions
2. Verifique se o secret está configurado corretamente
3. Verifique as permissões da chave de serviço

---

**Desenvolvido por**: Manus AI  
**Data**: 11 de Janeiro de 2026  
**Workflow**: `.github/workflows/deploy.yml`
