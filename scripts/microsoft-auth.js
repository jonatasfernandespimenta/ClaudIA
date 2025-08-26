const https = require('https');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Carrega as variáveis de ambiente
require('dotenv').config();

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';
const REDIRECT_URI = 'http://localhost:3000/auth/microsoft/callback';
const SCOPES = 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read';

// URLs da Microsoft
const AUTHORIZE_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`;
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

console.log('🚀 Iniciando processo de autenticação com Microsoft Graph...\n');
console.log(`🏢 Usando tenant: ${TENANT_ID}\n`);

if (!CLIENT_ID) {
    console.error('❌ Erro: MICROSOFT_CLIENT_ID deve estar configurado no .env');
    process.exit(1);
}

if (CLIENT_SECRET) {
    console.log('🔐 Usando aplicação confidencial (com client_secret)');
} else {
    console.log('🔓 Usando aplicação pública (sem client_secret)');
}

// Função para fazer requisições HTTPS
function makeHttpsRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Função para atualizar o arquivo .env
function updateEnvFile(token, refreshToken = null) {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Atualiza o MS_GRAPH_TOKEN
    if (envContent.includes('MS_GRAPH_TOKEN=')) {
        envContent = envContent.replace(/MS_GRAPH_TOKEN=.*$/m, `MS_GRAPH_TOKEN=${token}`);
    } else {
        envContent += `\nMS_GRAPH_TOKEN=${token}`;
    }
    
    // Adiciona refresh token se fornecido
    if (refreshToken) {
        if (envContent.includes('MS_GRAPH_REFRESH_TOKEN=')) {
            envContent = envContent.replace(/MS_GRAPH_REFRESH_TOKEN=.*$/m, `MS_GRAPH_REFRESH_TOKEN=${refreshToken}`);
        } else {
            envContent += `\nMS_GRAPH_REFRESH_TOKEN=${refreshToken}`;
        }
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env atualizado com sucesso!');
}

// Cria o servidor local para receber o callback
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/auth/microsoft/callback') {
        const { code, error, error_description } = parsedUrl.query;
        
        if (error) {
            console.error('❌ Erro na autorização:', error_description || error);
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`<h1>Erro na Autorização</h1><p>${error_description || error}</p>`);
            server.close();
            return;
        }
        
        if (!code) {
            console.error('❌ Código de autorização não recebido');
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Erro</h1><p>Código de autorização não recebido</p>');
            server.close();
            return;
        }
        
        console.log('📝 Código de autorização recebido, trocando por token...');
        
        try {
            // Troca o código pelo token
            // Para aplicações públicas, não enviamos o client_secret
            const tokenData = CLIENT_SECRET ? 
                querystring.stringify({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI,
                    scope: SCOPES
                }) :
                querystring.stringify({
                    client_id: CLIENT_ID,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI,
                    scope: SCOPES
                });
            
            const tokenOptions = {
                hostname: 'login.microsoftonline.com',
                path: `/${TENANT_ID}/oauth2/v2.0/token`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(tokenData)
                }
            };
            
            const tokenResponse = await makeHttpsRequest(tokenOptions, tokenData);
            
            if (tokenResponse.access_token) {
                console.log('🎉 Token obtido com sucesso!');
                console.log(`📅 Válido por: ${tokenResponse.expires_in} segundos`);
                
                // Atualiza o arquivo .env
                updateEnvFile(tokenResponse.access_token, tokenResponse.refresh_token);
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <h1>✅ Autenticação Concluída!</h1>
                    <p>Token do Microsoft Graph foi salvo no arquivo .env</p>
                    <p>Você pode fechar esta janela.</p>
                    <script>setTimeout(() => window.close(), 3000);</script>
                `);
            } else {
                console.error('❌ Erro ao obter token:', tokenResponse);
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`<h1>Erro ao obter token</h1><pre>${JSON.stringify(tokenResponse, null, 2)}</pre>`);
            }
        } catch (error) {
            console.error('❌ Erro na requisição do token:', error.message);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<h1>Erro interno</h1><p>${error.message}</p>`);
        }
        
        server.close();
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// Inicia o servidor
server.listen(3000, () => {
    console.log('🌐 Servidor local iniciado em http://localhost:3000');
    
    // Constrói a URL de autorização
    const authParams = querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        response_mode: 'query'
    });
    
    const authUrl = `${AUTHORIZE_URL}?${authParams}`;
    
    console.log('\n📋 Para obter o token do Microsoft Graph:');
    console.log('1. Abra o link abaixo no seu navegador');
    console.log('2. Faça login com sua conta Microsoft');
    console.log('3. Autorize as permissões solicitadas');
    console.log('4. O token será automaticamente salvo no seu .env\n');
    console.log('🔗 Link de autorização:');
    console.log(authUrl);
    
    // Tenta abrir automaticamente no navegador (macOS)
    const { exec } = require('child_process');
    exec(`open "${authUrl}"`);
});

// Trata o fechamento do servidor
server.on('close', () => {
    console.log('\n🔚 Processo de autenticação finalizado.');
    process.exit(0);
});

// Trata interrupção manual
process.on('SIGINT', () => {
    console.log('\n⏹️  Processo interrompido pelo usuário.');
    server.close();
});
