const https = require('https');
require('dotenv').config();

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';

console.log('🔍 Microsoft Auth Configuration Diagnostic\n');

// Verifica as configurações
console.log('📋 Current Configuration:');
console.log(`   Client ID: ${CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Client Secret: ${CLIENT_SECRET ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Tenant ID: ${TENANT_ID}\n`);

if (!CLIENT_ID) {
    console.error('❌ MICROSOFT_CLIENT_ID is required. Please check your .env file.');
    process.exit(1);
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
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: data });
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

async function testTokenRequest() {
    console.log('🧪 Testing token request to identify application type...\n');
    
    // Tenta uma requisição inválida para obter informações sobre o tipo de app
    const testData = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default'
    }).toString();
    
    const options = {
        hostname: 'login.microsoftonline.com',
        path: `/${TENANT_ID}/oauth2/v2.0/token`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(testData)
        }
    };
    
    try {
        const response = await makeHttpsRequest(options, testData);
        
        console.log(`📡 Response Status: ${response.statusCode}`);
        console.log('📄 Response Body:');
        console.log(JSON.stringify(response.body, null, 2));
        
        if (response.body.error) {
            const errorCode = response.body.error_codes ? response.body.error_codes[0] : null;
            
            console.log('\n🔍 Error Analysis:');
            
            switch (errorCode) {
                case 700025:
                    console.log('   🔓 Application Type: PUBLIC');
                    console.log('   📝 Solution: Remove MICROSOFT_CLIENT_SECRET from .env or configure app as confidential in Azure AD');
                    break;
                case 700016:
                    console.log('   🔐 Application Type: CONFIDENTIAL (requires client_secret)');
                    console.log('   📝 Solution: Ensure MICROSOFT_CLIENT_SECRET is correctly set in .env');
                    break;
                case 700003:
                    console.log('   ❓ Application Type: Unknown client_id or tenant configuration issue');
                    console.log('   📝 Solution: Verify CLIENT_ID and TENANT_ID are correct');
                    break;
                default:
                    console.log(`   ⚠️  Unknown error code: ${errorCode}`);
                    console.log('   📝 Check Azure AD application configuration');
            }
        }
        
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

async function checkApplicationConfiguration() {
    console.log('\n🏢 Application Configuration Recommendations:\n');
    
    if (CLIENT_SECRET) {
        console.log('🔐 You have a CLIENT_SECRET configured. This suggests:');
        console.log('   - Your app should be configured as CONFIDENTIAL in Azure AD');
        console.log('   - OR you need to remove the CLIENT_SECRET to use as PUBLIC app\n');
    } else {
        console.log('🔓 No CLIENT_SECRET configured. This suggests:');
        console.log('   - Your app should be configured as PUBLIC in Azure AD');
        console.log('   - This is the recommended setup for desktop/CLI applications\n');
    }
    
    console.log('📚 Steps to fix in Azure AD Portal:');
    console.log('1. Go to https://portal.azure.com');
    console.log('2. Navigate to Azure Active Directory > App registrations');
    console.log('3. Find your application');
    console.log('4. Go to "Authentication" section');
    console.log('5. Under "Advanced settings", check "Allow public client flows"');
    console.log('6. If you want to use as public app: Enable "Allow public client flows"');
    console.log('7. If you want to use as confidential app: Ensure you have a valid client secret\n');
}

// Executa os testes
async function runDiagnostic() {
    await testTokenRequest();
    await checkApplicationConfiguration();
}

runDiagnostic();
