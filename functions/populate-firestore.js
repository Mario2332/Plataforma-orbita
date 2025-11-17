/**
 * Script para popular o Firestore com dados base de conteúdos
 * Execução: node populate-firestore.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function populateFirestore() {
  try {
    console.log('📂 Carregando JSON...');
    
    // Carregar JSON
    const jsonPath = path.join(__dirname, 'src', 'study-content-data.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const baseData = JSON.parse(jsonContent);
    
    console.log(`✅ JSON carregado: ${Object.keys(baseData).length} matérias`);
    
    // Verificar se já existe
    const existingDocs = await db.collection('conteudos_base').limit(1).get();
    if (!existingDocs.empty) {
      console.log('⚠️  Collection conteudos_base já existe!');
      console.log('   Deseja sobrescrever? (Ctrl+C para cancelar)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Importar para Firestore
    console.log('\n🚀 Salvando no Firestore...');
    let count = 0;
    
    for (const [materiaKey, materiaData] of Object.entries(baseData)) {
      await db.collection('conteudos_base').doc(materiaKey).set(materiaData);
      count++;
      const topicsCount = materiaData.topics?.length || 0;
      console.log(`  ✅ ${materiaKey}: ${topicsCount} tópicos`);
    }
    
    console.log(`\n✅ Importação concluída!`);
    console.log(`📊 Resumo:`);
    console.log(`   - Matérias importadas: ${count}`);
    console.log(`   - Collection: conteudos_base`);
    console.log(`   - Projeto: ${admin.instanceId().app.options.projectId}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

populateFirestore();
