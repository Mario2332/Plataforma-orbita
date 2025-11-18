// Script de verificação de versão - roda ANTES do React carregar
// Este script força atualização adicionando timestamp na URL

(function() {
  const CURRENT_VERSION = '2024-11-18-17-00'; // Atualizar a cada deploy
  const VERSION_KEY = 'app_version';
  
  // Verificar versão armazenada
  const storedVersion = localStorage.getItem(VERSION_KEY);
  
  console.log('[Version Check] Versão armazenada:', storedVersion);
  console.log('[Version Check] Versão atual:', CURRENT_VERSION);
  
  if (storedVersion !== CURRENT_VERSION) {
    console.log('[Version Check] Nova versão detectada! Limpando cache...');
    
    // Limpar localStorage (exceto dados importantes)
    const keysToKeep = ['firebase:authUser', 'firebase:host'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.some(k => key.includes(k))) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar sessionStorage
    sessionStorage.clear();
    
    // Atualizar versão
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    
    // Forçar reload com cache bypass
    const url = new URL(window.location.href);
    if (!url.searchParams.has('_v')) {
      url.searchParams.set('_v', Date.now());
      console.log('[Version Check] Recarregando com cache bypass...');
      window.location.replace(url.toString());
      return;
    }
  }
  
  // Remover parâmetro _v da URL se existir (para manter URL limpa)
  const url = new URL(window.location.href);
  if (url.searchParams.has('_v')) {
    url.searchParams.delete('_v');
    window.history.replaceState({}, '', url.toString());
  }
  
  console.log('[Version Check] Versão OK!');
})();
