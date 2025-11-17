/**
 * Script para popular templates de cronograma anual no Firestore
 * Execução: node populate-cronograma-templates.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Dados do cronograma extensivo (extraído do Cronograma-ENEM)
const cronogramaExtensivo = require('./src/data/cronograma-extensivo.json');
const cronogramaIntensivo = require('./src/data/cronograma-intensivo.json');

async function populateTemplates() {
  try {
    console.log('📦 Populando templates de cronograma anual...\n');
    
    // Template Extensivo
    console.log('📝 Salvando template extensivo...');
    await db.collection('templates_cronograma').doc('extensive').set({
      cycles: cronogramaExtensivo,
      tipo: 'extensive',
      nome: 'Cronograma Extensivo',
      descricao: 'Cronograma completo para preparação ao longo do ano',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Template extensivo salvo: ${cronogramaExtensivo.length} ciclos\n`);
    
    // Template Intensivo
    console.log('📝 Salvando template intensivo...');
    await db.collection('templates_cronograma').doc('intensive').set({
      cycles: cronogramaIntensivo,
      tipo: 'intensive',
      nome: 'Cronograma Intensivo',
      descricao: 'Cronograma focado para preparação intensiva',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Template intensivo salvo: ${cronogramaIntensivo.length} ciclos\n`);
    
    console.log('✅ Templates populados com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - Extensivo: ${cronogramaExtensivo.length} ciclos`);
    console.log(`   - Intensivo: ${cronogramaIntensivo.length} ciclos`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular templates:', error);
    process.exit(1);
  }
}

populateTemplates();
