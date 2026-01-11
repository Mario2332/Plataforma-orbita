# APIs Necessárias para o Projeto orbita-free

Para fazer o deploy completo de Cloud Functions e outros recursos do Firebase, você precisa habilitar as seguintes APIs no projeto **orbita-free**:

## APIs Principais para Cloud Functions

1. **Cloud Functions API**
   - Nome: `cloudfunctions.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=orbita-free

2. **Cloud Build API**
   - Nome: `cloudbuild.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=orbita-free

3. **Artifact Registry API**
   - Nome: `artifactregistry.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=orbita-free

4. **Firebase Extensions API**
   - Nome: `firebaseextensions.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/firebaseextensions.googleapis.com?project=orbita-free

5. **Cloud Scheduler API** (para funções agendadas)
   - Nome: `cloudscheduler.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com?project=orbita-free

## APIs Adicionais Recomendadas

6. **Cloud Logging API**
   - Nome: `logging.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/logging.googleapis.com?project=orbita-free

7. **Cloud Resource Manager API**
   - Nome: `cloudresourcemanager.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/cloudresourcemanager.googleapis.com?project=orbita-free

8. **Service Usage API**
   - Nome: `serviceusage.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/serviceusage.googleapis.com?project=orbita-free

9. **Cloud Firestore API**
   - Nome: `firestore.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=orbita-free

10. **Firebase Hosting API**
   - Nome: `firebasehosting.googleapis.com`
   - URL: https://console.cloud.google.com/apis/library/firebasehosting.googleapis.com?project=orbita-free

11. **Identity and Access Management (IAM) API**
    - Nome: `iam.googleapis.com`
    - URL: https://console.cloud.google.com/apis/library/iam.googleapis.com?project=orbita-free

## Forma Rápida de Habilitar Todas

Você pode habilitar todas as APIs de uma vez acessando:

**Opção 1: Via Console do Google Cloud**
1. Acesse: https://console.cloud.google.com/apis/library?project=orbita-free
2. Pesquise cada API pelo nome (ex: "Cloud Functions API")
3. Clique em "Habilitar"

**Opção 2: Via gcloud CLI (se você tiver instalado)**
Execute o seguinte comando no terminal:

```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firebaseextensions.googleapis.com \
  cloudscheduler.googleapis.com \
  logging.googleapis.com \
  cloudresourcemanager.googleapis.com \
  serviceusage.googleapis.com \
  firestore.googleapis.com \
  firebasehosting.googleapis.com \
  iam.googleapis.com \
  --project=orbita-free
```

## Status Atual

✅ **Já habilitadas:**
- Cloud Functions API
- Cloud Build API
- Artifact Registry API

❌ **Faltam habilitar:**
- Cloud Scheduler API (necessária agora)
- Outras APIs recomendadas (opcional, mas evita erros futuros)

## Recomendação

Habilite pelo menos as **5 APIs principais** listadas acima para garantir que o deploy de Cloud Functions funcione sem interrupções.
