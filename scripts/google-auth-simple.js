const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

async function getGoogleRefreshToken() {
  console.log('🔐 Google Calendar Authentication - Modo Simplificado');
  console.log('=====================================================');
  console.log('');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'  // Usar modo manual
  );

  // Gerar URL de autorização
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('📋 PASSO 1: Copie e cole este URL no seu navegador:');
  console.log('');
  console.log(authUrl);
  console.log('');
  console.log('📋 PASSO 2: Após autorizar, você receberá um código.');
  console.log('📋 PASSO 3: Cole o código aqui quando solicitado.');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('🔑 Cole o código de autorização aqui: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  try {
    console.log('⏳ Trocando código por tokens...');
    
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('🎉 Tokens obtidos com sucesso!');
    console.log('📝 Refresh Token:', tokens.refresh_token);
    
    // Atualizar arquivo .env
    await updateEnvFile(tokens.refresh_token);
    
    console.log('');
    console.log('✅ Configuração concluída!');
    console.log('📄 Arquivo .env atualizado com o refresh token.');
    console.log('🚀 Agora você pode usar o ClaudIA com seu Google Calendar!');
    
  } catch (error) {
    console.error('❌ Erro ao obter tokens:', error.message);
    process.exit(1);
  }
}

async function updateEnvFile(refreshToken) {
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Atualizar ou adicionar GOOGLE_REFRESH_TOKEN
  if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
    envContent = envContent.replace(
      /GOOGLE_REFRESH_TOKEN=.*/,
      `GOOGLE_REFRESH_TOKEN=${refreshToken}`
    );
  } else {
    envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('📄 Arquivo .env atualizado!');
}

// Verificar se as credenciais estão configuradas
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Erro: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados no arquivo .env');
  process.exit(1);
}

console.log('🚀 Iniciando processo de autenticação do Google Calendar...');
getGoogleRefreshToken().catch(console.error);
