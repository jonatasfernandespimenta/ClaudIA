# Como Registrar a Aplicação Microsoft Graph no Azure AD

## Passo a Passo

1. **Acesse o Azure Portal**
   - Vá para: https://portal.azure.com
   - Faça login com sua conta corporativa (@pr.itaicx.com)

2. **Navegue até Azure Active Directory**
   - No menu lateral, clique em "Azure Active Directory"
   - Ou use a barra de pesquisa

3. **Registros de Aplicativo**
   - No menu do Azure AD, clique em "App registrations" (Registros de aplicativo)
   - Clique em "+ New registration" (+ Novo registro)

4. **Configurar o Registro**
   - **Nome**: `ClaudIA Microsoft Graph Integration`
   - **Tipos de conta com suporte**: 
     - Selecione "Accounts in this organizational directory only" (Somente contas neste diretório organizacional)
   - **URI de Redirecionamento**:
     - Tipo: Web
     - URI: `http://localhost:3000/auth/microsoft/callback`

5. **Obter as Credenciais**
   Após criar, você verá:
   - **Application (client) ID**: Este será seu novo MICROSOFT_CLIENT_ID
   - **Directory (tenant) ID**: ID do seu tenant

6. **Criar Client Secret**
   - Vá para "Certificates & secrets" (Certificados e segredos)
   - Clique em "+ New client secret" (+ Novo segredo do cliente)
   - Adicione uma descrição: `ClaudIA Auth Secret`
   - Escolha expiração: 24 meses
   - **IMPORTANTE**: Copie o valor imediatamente, ele não será mostrado novamente!

7. **Configurar Permissões da API**
   - Vá para "API permissions" (Permissões de API)
   - Clique em "+ Add a permission" (+ Adicionar uma permissão)
   - Selecione "Microsoft Graph"
   - Escolha "Delegated permissions"
   - Adicione as seguintes permissões:
     - `Mail.Read`
     - `Mail.Send` 
     - `Calendars.ReadWrite`
     - `User.Read`
   - Clique em "Add permissions"
   - **IMPORTANTE**: Clique em "Grant admin consent" para aprovar as permissões

## Próximos Passos

Após completar o registro, atualize seu arquivo .env com:
- O novo Application (client) ID
- O novo Client Secret
- Opcionalmente, o Tenant ID se quiser usar autenticação específica do tenant
