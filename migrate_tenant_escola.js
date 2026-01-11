#!/usr/bin/env node
/**
 * Script de Migração: Adicionar tenantId e renomear mentor → escola
 * 
 * Este script:
 * 1. Copia coleção "mentores" para "escolas"
 * 2. Adiciona campo "tenantId" em users, alunos e escolas
 * 3. Renomeia campo "mentorId" para "escolaId" em alunos
 * 4. Atualiza role "mentor" para "escola" em users
 */

const admin = require('firebase-admin');
const serviceAccount = require('./plataforma-orbita-firebase-adminsdk-fbsvc-707d9d55f6.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuração: Definir qual tenant usar como padrão
// Você pode ajustar isso conforme necessário
const DEFAULT_TENANT_ID = 'orbita'; // Tenant padrão para dados existentes

/**
 * Função principal de migração
 */
async function migrate() {
  console.log('🚀 Iniciando migração...\n');
  
  try {
    // Passo 1: Copiar mentores para escolas
    await migrateMentoresToEscolas();
    
    // Passo 2: Adicionar tenantId em users
    await addTenantIdToUsers();
    
    // Passo 3: Adicionar tenantId e renomear mentorId em alunos
    await migrateAlunos();
    
    // Passo 4: Adicionar tenantId em escolas
    await addTenantIdToEscolas();
    
    // Passo 5: Adicionar tenantId em gestores
    await addTenantIdToGestores();
    
    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Verifique os dados no Firestore Console');
    console.log('2. Teste o login de escola e aluno');
    console.log('3. Valide o isolamento por tenant');
    console.log('4. Após validação, você pode deletar a coleção "mentores" antiga\n');
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  }
}

/**
 * Passo 1: Copiar coleção mentores para escolas
 */
async function migrateMentoresToEscolas() {
  console.log('📋 Passo 1: Copiando mentores para escolas...');
  
  const mentoresSnapshot = await db.collection('mentores').get();
  
  if (mentoresSnapshot.empty) {
    console.log('   ⚠️  Nenhum mentor encontrado. Pulando...');
    return;
  }
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of mentoresSnapshot.docs) {
    const data = doc.data();
    const escolaRef = db.collection('escolas').doc(doc.id);
    
    // Copiar todos os dados do mentor para escola
    batch.set(escolaRef, {
      ...data,
      tenantId: data.tenantId || DEFAULT_TENANT_ID, // Adicionar tenantId se não existir
      migratedFrom: 'mentores', // Marcar origem
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    count++;
    
    // Firestore batch limit é 500 operações
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`   ✓ ${count} mentores copiados...`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`   ✅ ${count} mentores copiados para escolas\n`);
}

/**
 * Passo 2: Adicionar tenantId em users
 */
async function addTenantIdToUsers() {
  console.log('📋 Passo 2: Adicionando tenantId em users...');
  
  const usersSnapshot = await db.collection('users').get();
  
  if (usersSnapshot.empty) {
    console.log('   ⚠️  Nenhum usuário encontrado. Pulando...');
    return;
  }
  
  const batch = db.batch();
  let count = 0;
  let mentorCount = 0;
  
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const userRef = db.collection('users').doc(doc.id);
    
    const updates = {};
    
    // Adicionar tenantId se não existir
    if (!data.tenantId) {
      updates.tenantId = DEFAULT_TENANT_ID;
    }
    
    // Atualizar role de "mentor" para "escola"
    if (data.role === 'mentor') {
      updates.role = 'escola';
      mentorCount++;
    }
    
    if (Object.keys(updates).length > 0) {
      batch.update(userRef, updates);
      count++;
    }
    
    // Firestore batch limit
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`   ✓ ${count} usuários atualizados...`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`   ✅ ${count} usuários atualizados`);
  console.log(`   ✅ ${mentorCount} roles "mentor" → "escola"\n`);
}

/**
 * Passo 3: Adicionar tenantId e renomear mentorId em alunos
 */
async function migrateAlunos() {
  console.log('📋 Passo 3: Migrando alunos (tenantId + mentorId → escolaId)...');
  
  const alunosSnapshot = await db.collection('alunos').get();
  
  if (alunosSnapshot.empty) {
    console.log('   ⚠️  Nenhum aluno encontrado. Pulando...');
    return;
  }
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of alunosSnapshot.docs) {
    const data = doc.data();
    const alunoRef = db.collection('alunos').doc(doc.id);
    
    const updates = {};
    
    // Adicionar tenantId se não existir
    if (!data.tenantId) {
      updates.tenantId = DEFAULT_TENANT_ID;
    }
    
    // Renomear mentorId para escolaId
    if (data.mentorId && !data.escolaId) {
      updates.escolaId = data.mentorId;
      // Remover campo antigo
      updates.mentorId = admin.firestore.FieldValue.delete();
    }
    
    if (Object.keys(updates).length > 0) {
      batch.update(alunoRef, updates);
      count++;
    }
    
    // Firestore batch limit
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`   ✓ ${count} alunos atualizados...`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`   ✅ ${count} alunos atualizados\n`);
}

/**
 * Passo 4: Adicionar tenantId em escolas
 */
async function addTenantIdToEscolas() {
  console.log('📋 Passo 4: Adicionando tenantId em escolas...');
  
  const escolasSnapshot = await db.collection('escolas').get();
  
  if (escolasSnapshot.empty) {
    console.log('   ⚠️  Nenhuma escola encontrada. Pulando...');
    return;
  }
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of escolasSnapshot.docs) {
    const data = doc.data();
    
    // Adicionar tenantId se não existir
    if (!data.tenantId) {
      const escolaRef = db.collection('escolas').doc(doc.id);
      batch.update(escolaRef, {
        tenantId: DEFAULT_TENANT_ID
      });
      count++;
    }
    
    // Firestore batch limit
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`   ✓ ${count} escolas atualizadas...`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`   ✅ ${count} escolas atualizadas\n`);
}

/**
 * Passo 5: Adicionar tenantId em gestores
 */
async function addTenantIdToGestores() {
  console.log('📋 Passo 5: Adicionando tenantId em gestores...');
  
  const gestoresSnapshot = await db.collection('gestores').get();
  
  if (gestoresSnapshot.empty) {
    console.log('   ⚠️  Nenhum gestor encontrado. Pulando...');
    return;
  }
  
  const batch = db.batch();
  let count = 0;
  
  for (const doc of gestoresSnapshot.docs) {
    const data = doc.data();
    
    // Adicionar tenantId se não existir
    // Gestores geralmente pertencem ao tenant master
    if (!data.tenantId) {
      const gestorRef = db.collection('gestores').doc(doc.id);
      batch.update(gestorRef, {
        tenantId: 'orbita' // Tenant master
      });
      count++;
    }
    
    // Firestore batch limit
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`   ✓ ${count} gestores atualizados...`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`   ✅ ${count} gestores atualizados\n`);
}

// Executar migração
migrate()
  .then(() => {
    console.log('Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
