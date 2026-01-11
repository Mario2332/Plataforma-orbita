## 🚀 Guia de Atualização e Deploy Multi-Tenant - Plataforma Órbita WHITE LABEL

Este documento descreve o processo para garantir que todas as atualizações no código-base da Plataforma Órbita WHITE LABEL sejam aplicadas automaticamente a todos os clientes white label ativos, mantendo suas personalizações de cores e branding.

---

### 🎯 Visão Geral da Estratégia

A Plataforma Órbita utiliza uma arquitetura de **código-base único** com **configuração dinâmica de tenant** via Firestore. Isso significa que um único build do frontend pode ser deployado para múltiplos projetos Firebase Hosting, e cada cliente terá sua experiência personalizada (cores, features ativas, etc.) carregada em tempo de execução com base no domínio.

**Benefícios:**
- **Consistência:** Todos os clientes rodam a mesma versão do código.
- **Eficiência:** Um único build e deploy para todos.
- **Manutenção Simplificada:** Atualizações e correções aplicadas globalmente.
- **Personalização Preservada:** Branding e features controlados via Firestore.

---

### 🛠️ Componentes Chave

1.  **Código-Base (`Plataforma-orbita`):** Contém todo o frontend da aplicação.
2.  **`TenantContext.tsx`:** Responsável por detectar o domínio e carregar a `TenantConfig` correspondente do Firestore, aplicando personalizações de branding e controlando a visibilidade das features e anúncios.
3.  **Firestore (`collection: tenants`):** Armazena a `TenantConfig` de cada cliente white label, incluindo:
    - `dominios`: Lista de domínios associados ao cliente.
    - `branding`: `logo`, `corPrimaria`, `corSecundaria`, `nomeExibicao`.
    - `features`: Booleans para ativar/desativar abas e sub-abas.
    - `ads`: Configurações de exibição de anúncios e AdSense.
4.  **Script de Deploy Multi-Tenant (`deploy_multi_tenant.py`):** Automatiza o deploy do frontend para múltiplos projetos Firebase Hosting.
5.  **Chaves de Conta de Serviço:** Arquivos `.json` necessários para autenticar o Firebase CLI e realizar o deploy para cada projeto Firebase do cliente.

---

### 🚀 Processo de Atualização e Deploy

Para aplicar uma atualização (ex: novo layout, correção de bug, nova feature) a todos os clientes white label, siga os passos abaixo:

#### **Passo 1: Desenvolver e Testar a Alteração**

1.  Realize as alterações necessárias no código-base (`Plataforma-orbita`).
2.  Teste exaustivamente em um ambiente de desenvolvimento local ou em um projeto de staging para garantir que tudo funciona como esperado e que as personalizações de branding continuam sendo aplicadas corretamente.

#### **Passo 2: Realizar o Build do Frontend**

1.  Navegue até o diretório `client` do projeto:
    ```bash
    cd /home/ubuntu/Plataforma-orbita/client
    ```
2.  Execute o comando de build:
    ```bash
    pnpm run build
    ```
    Isso irá gerar os arquivos estáticos otimizados na pasta `/home/ubuntu/Plataforma-orbita/dist`.

#### **Passo 3: Configurar o Script de Deploy Multi-Tenant**

1.  **Chaves de Conta de Serviço:** Certifique-se de que todas as chaves `.json` das contas de serviço dos projetos Firebase de cada cliente white label estejam acessíveis (ex: no diretório `/home/ubuntu/firebase_service_accounts/`).
2.  **Atualizar `tenant_projects`:** Edite o script `/home/ubuntu/deploy_multi_tenant.py` e atualize a lista `tenant_projects` com os IDs de todos os projetos Firebase dos clientes white label que devem receber a atualização.
    ```python
    # Exemplo de tenant_projects no script deploy_multi_tenant.py
    tenant_projects = [
        "orbita-free",
        "cliente-a-project-id",
        "cliente-b-project-id",
        # Adicione mais IDs de projetos aqui
    ]
    ```
3.  **Caminho da Chave:** Se as chaves de serviço estiverem em um diretório diferente, atualize `service_account_key_path` no script para apontar para o local correto de cada chave (ou crie uma lógica para iterar sobre elas).

#### **Passo 4: Executar o Deploy Multi-Tenant**

1.  Navegue até o diretório onde o script `deploy_multi_tenant.py` está localizado:
    ```bash
    cd /home/ubuntu/
    ```
2.  Execute o script Python:
    ```bash
    python3 deploy_multi_tenant.py
    ```
    O script irá iterar sobre cada `project_id` na lista `tenant_projects` e realizará o deploy do conteúdo da pasta `dist` para o Firebase Hosting de cada projeto.

    **Exemplo de Saída do Script:**
    ```
    --- Iniciando deploy para o projeto: orbita-free ---
    Deploy para orbita-free CONCLUÍDO com sucesso!
    Hosting URL: https://orbita-free.web.app

    --- Iniciando deploy para o projeto: cliente-a-project-id ---
    Deploy para cliente-a-project-id CONCLUÍDO com sucesso!
    Hosting URL: https://cliente-a.web.app

    --- Processo de deploy multi-tenant finalizado ---
    ```

#### **Passo 5: Verificação Pós-Deploy**

1.  Acesse as URLs de Hosting de alguns clientes white label para verificar se a atualização foi aplicada corretamente.
2.  Confirme se as personalizações de branding (cores, logo) de cada cliente ainda estão intactas.
3.  Verifique se as features e anúncios estão se comportando conforme as configurações no Firestore de cada tenant.

---

### ⚠️ Considerações Importantes

-   **Gerenciamento de Credenciais:** Mantenha as chaves de conta de serviço (`.json`) em um local seguro e com acesso restrito.
-   **Testes:** Sempre teste as alterações em um ambiente de staging antes de deployar para produção em múltiplos clientes.
-   **Firestore `tenants` Collection:** Garanta que a coleção `tenants` no Firestore esteja sempre atualizada com as configurações corretas para cada cliente white label.
-   **Cache do Navegador:** Após o deploy, os usuários podem precisar limpar o cache do navegador (Ctrl+Shift+R) para ver as alterações imediatamente.

---

Este processo garante que a Plataforma Órbita WHITE LABEL possa ser atualizada de forma eficiente e consistente para todos os seus clientes, mantendo a flexibilidade de personalização que o modelo white label exige.
