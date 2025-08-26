const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const PORT = 3000;

async function getGoogleRefreshToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Gerar URL de autorização
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('🔐 Google Calendar Authentication');
  console.log('================================');
  console.log('');
  console.log('🌐 Abra este URL no seu navegador para autorizar a aplicação:');
  console.log('');
  console.log(authUrl);
  console.log('');
  console.log('📱 Alternativamente, um servidor local foi iniciado...');
  console.log(`🔗 Acesse: http://localhost:${PORT}/auth`);
  console.log('');
  console.log('⏳ Aguardando autorização...');

  // Criar servidor temporário para capturar o callback
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/auth') {
      // Redirecionar para Google
      res.writeHead(302, { Location: authUrl });
      res.end();
    } else if (parsedUrl.pathname === '/auth/callback') {
      const code = parsedUrl.query.code;
      
      if (code) {
        try {
          console.log('✅ Código de autorização recebido!');
          
          // Trocar código por tokens
          const { tokens } = await oauth2Client.getToken(code);
          
          console.log('🎉 Tokens obtidos com sucesso!');
          console.log('📝 Refresh Token:', tokens.refresh_token);
          
          // Atualizar arquivo .env
          await updateEnvFile(tokens.refresh_token);
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: green;">✅ Autenticação realizada com sucesso!</h2>
                <p>O ClaudIA agora pode acessar seu Google Calendar.</p>
                <p>Você pode fechar esta janela e voltar ao terminal.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);
          
          console.log('');
          console.log('🎉 Configuração concluída!');
          console.log('📄 Arquivo .env atualizado com o refresh token.');
          console.log('🚀 Agora você pode usar o ClaudIA com seu Google Calendar!');
          
          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 2000);
        } catch (error) {
          console.error('❌ Erro ao obter tokens:', error.message);
          
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: red;">❌ Erro na autenticação</h2>
                <p>Ocorreu um erro. Verifique o terminal para mais detalhes.</p>
              </body>
            </html>
          `);
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Código de autorização não encontrado.');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.listen(PORT, () => {
    console.log(`🖥️ Servidor local rodando em http://localhost:${PORT}`);
  });
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
}

// Verificar se as credenciais estão configuradas
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Erro: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados no arquivo .env');
  process.exit(1);
}

console.log('🚀 Iniciando processo de autenticação do Google Calendar...');
getGoogleRefreshToken().catch(console.error);
