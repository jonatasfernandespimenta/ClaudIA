#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔍 Status dos Tokens da Microsoft Graph\n');

// Verifica se as variáveis estão configuradas
const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
const accessToken = process.env.MS_GRAPH_TOKEN;
const refreshToken = process.env.MS_GRAPH_REFRESH_TOKEN;
const expiresAt = process.env.MS_GRAPH_TOKEN_EXPIRES_AT;

console.log('📋 Configuração:');
console.log(`   Client ID: ${clientId ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   Client Secret: ${clientSecret ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   Tenant ID: ${tenantId}`);
console.log('');

console.log('🎫 Tokens:');
console.log(`   Access Token: ${accessToken ? '✅ Disponível' : '❌ Não disponível'}`);
console.log(`   Refresh Token: ${refreshToken ? '✅ Disponível' : '❌ Não disponível'}`);

if (expiresAt) {
  const expirationDate = new Date(parseInt(expiresAt));
  const now = new Date();
  const timeLeft = expirationDate.getTime() - now.getTime();
  
  console.log(`   Expira em: ${expirationDate.toLocaleString()}`);
  
  if (timeLeft > 0) {
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    const hoursLeft = Math.floor(minutesLeft / 60);
    const daysLeft = Math.floor(hoursLeft / 24);
    
    if (daysLeft > 0) {
      console.log(`   ⏳ Tempo restante: ${daysLeft} dia(s), ${hoursLeft % 24} hora(s)`);
    } else if (hoursLeft > 0) {
      console.log(`   ⏳ Tempo restante: ${hoursLeft} hora(s), ${minutesLeft % 60} minuto(s)`);
    } else if (minutesLeft > 5) {
      console.log(`   ⏳ Tempo restante: ${minutesLeft} minuto(s)`);
    } else if (minutesLeft > 0) {
      console.log(`   ⚠️  Token expirando em ${minutesLeft} minuto(s)!`);
    } else {
      console.log(`   ❌ Token EXPIRADO!`);
    }
  } else {
    console.log(`   ❌ Token EXPIRADO há ${Math.abs(Math.floor(timeLeft / (1000 * 60)))} minuto(s)`);
  }
} else {
  console.log(`   Expiração: ❌ Não definida`);
}

console.log('');

// Verifica se está tudo configurado para funcionar
const hasRequiredConfig = clientId && accessToken;
const hasRefreshCapability = refreshToken && clientSecret;

if (hasRequiredConfig) {
  console.log('✅ Configuração básica OK - Microsoft Graph pode ser usado');
  
  if (hasRefreshCapability) {
    console.log('✅ Renovação automática disponível - Tokens serão renovados automaticamente');
  } else {
    console.log('⚠️  Renovação automática NÃO disponível - Execute nova autenticação quando o token expirar');
    console.log('   Para habilitar renovação automática, certifique-se de ter:');
    console.log('   - MICROSOFT_CLIENT_SECRET configurado');
    console.log('   - MS_GRAPH_REFRESH_TOKEN obtido durante autenticação');
  }
} else {
  console.log('❌ Configuração incompleta - Execute a autenticação primeiro');
  console.log('   Execute: npm run auth:microsoft');
}

console.log('');
console.log('💡 Comandos úteis:');
console.log('   npm run auth:microsoft  - Execute nova autenticação');
console.log('   node scripts/microsoft-token-status.js  - Verificar status novamente');
