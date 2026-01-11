# 🚀 Deploy Simples - 3 Passos

## ✅ O Que Já Foi Feito

- ✅ Migração de dados concluída
- ✅ Código atualizado e commitado
- ✅ Build do frontend OK
- ✅ Branch `feature/escola-tenant-isolation` no GitHub

---

## 🎯 Como Fazer Deploy (3 Passos Simples)

### **Opção 1: GitHub Actions (Recomendado - Sem Terminal)**

#### Passo 1: Adicionar Secret no GitHub

1. Acesse: https://github.com/Mario2332/Plataforma-orbita/settings/secrets/actions
2. Clique em "New repository secret"
3. **Name**: `FIREBASE_SERVICE_ACCOUNT`
4. **Value**: Cole o conteúdo do arquivo `plataforma-orbita-firebase-adminsdk-fbsvc-8ba3d7ee46.json`
5. Clique em "Add secret"

#### Passo 2: Criar Workflow

1. Acesse: https://github.com/Mario2332/Plataforma-orbita/new/feature/escola-tenant-isolation?filename=.github/workflows/deploy.yml
2. Cole o conteúdo abaixo:

```yaml
name: Deploy para Firebase

on:
  push:
    branches:
      - main
      - feature/escola-tenant-isolation
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy Completo
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
      
      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: 📦 Install pnpm
        run: npm install -g pnpm
      
      - name: 📦 Install dependencies
        run: pnpm install
      
      - name: 🏗️ Build Frontend
        run: cd client && pnpm run build
      
      - name: 🏗️ Build Functions
        run: cd functions && npm install && npm run build
      
      - name: 🔑 Setup Firebase
        run: |
          echo '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}' > $HOME/firebase-key.json
          echo "GOOGLE_APPLICATION_CREDENTIALS=$HOME/firebase-key.json" >> $GITHUB_ENV
      
      - name: 📦 Install Firebase CLI
        run: npm install -g firebase-tools
      
      - name: 🚀 Deploy All
        run: firebase deploy --project plataforma-orbita --non-interactive
```

3. Clique em "Commit changes"

#### Passo 3: Executar Deploy

1. Acesse: https://github.com/Mario2332/Plataforma-orbita/actions
2. Clique em "Deploy para Firebase"
3. Clique em "Run workflow"
4. Selecione branch `feature/escola-tenant-isolation`
5. Clique em "Run workflow"

**Pronto! O deploy será feito automaticamente.**

---

### **Opção 2: Firebase Console (Manual - Sem Código)**

Se preferir não usar GitHub Actions:

#### Para Firestore Rules:

1. Acesse: https://console.firebase.google.com/project/plataforma-orbita/firestore/rules
2. Copie o conteúdo de `firestore.rules`
3. Cole no editor
4. Clique em "Publicar"

#### Para Cloud Functions:

1. As Cloud Functions precisam ser deployadas via CLI
2. Ou use a Opção 1 (GitHub Actions)

#### Para Frontend:

1. Acesse: https://console.firebase.google.com/project/plataforma-orbita/hosting
2. Faça upload da pasta `client/dist`

---

## 📊 Validar Deploy

Após o deploy:

1. **Frontend**: https://plataforma-orbita.web.app
2. **Testar login**: https://plataforma-orbita.web.app/login/escola
3. **Verificar isolamento**: Escola só vê seus próprios alunos

---

## 🎉 Resultado Esperado

- ✅ Frontend atualizado com nova terminologia "Escola"
- ✅ Login de escola funcionando
- ✅ Isolamento por tenant ativo
- ✅ Cada cliente white-label com dados separados

---

## 📞 Dúvidas?

Consulte o `GUIA_GITHUB_ACTIONS.md` para mais detalhes.
