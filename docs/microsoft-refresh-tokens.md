# Sistema de Refresh Tokens para Microsoft Graph

## Visão Geral

Este documento explica como o sistema de refresh tokens funciona para resolver o problema de tokens da Microsoft que expiram muito rapidamente.

## Características Principais

- ✅ **Renovação Automática**: Tokens são renovados automaticamente antes de expirar
- ✅ **Cache Inteligente**: Sistema verifica expiração antes de cada uso
- ✅ **Fallback Gracioso**: Se a renovação falhar, usa o token existente temporariamente
- ✅ **Persistência**: Tokens são salvos automaticamente nas variáveis de ambiente
- ✅ **Logging Detalhado**: Logs completos para debugging e monitoramento

## Configuração Necessária

### Variáveis de Ambiente (.env)

```env
# Configuração básica (obrigatório)
MICROSOFT_CLIENT_ID=seu_client_id_aqui

# Para renovação automática (recomendado)
MICROSOFT_CLIENT_SECRET=seu_client_secret_aqui
MICROSOFT_TENANT_ID=common

# Tokens (preenchidos automaticamente)
MS_GRAPH_TOKEN=token_de_acesso
MS_GRAPH_REFRESH_TOKEN=refresh_token
MS_GRAPH_TOKEN_EXPIRES_AT=timestamp_de_expiracao

# Opcional
MS_GRAPH_USER_EMAIL=usuario@exemplo.com
```

## Como Usar

### 1. Primeira Autenticação

Execute o script de autenticação que irá:
- Abrir o navegador para login
- Obter access token e refresh token
- Salvar automaticamente no .env

```bash
npm run auth:microsoft
```

### 2. Verificar Status dos Tokens

Use o comando para verificar o estado atual dos tokens:

```bash
npm run auth:microsoft:status
```

Saída de exemplo:
```
📋 Configuração:
   Client ID: ✅ Configurado
   Client Secret: ✅ Configurado
   Tenant ID: common

🎫 Tokens:
   Access Token: ✅ Disponível
   Refresh Token: ✅ Disponível
   Expira em: 27/08/2025, 12:39:05
   ⏳ Tempo restante: 58 minuto(s)

✅ Configuração básica OK - Microsoft Graph pode ser usado
✅ Renovação automática disponível - Tokens serão renovados automaticamente
```

### 3. Uso Automático no Código

O sistema funciona automaticamente no `MicrosoftCalendarAdapter`:

```typescript
// O adapter usa automaticamente o sistema de tokens
const adapter = new MicrosoftCalendarAdapter();
await adapter.authenticate(); // Renova automaticamente se necessário

// As chamadas para a API funcionam normalmente
const events = await adapter.getEvents(startDate, endDate);
```

## Como Funciona Internamente

### 1. Verificação de Expiração

Antes de cada uso, o sistema verifica se o token expira em até 5 minutos:

```typescript
// Se o token expira em menos de 5 minutos, renova automaticamente
if (tokenExpiresIn < 5 * 60 * 1000) {
  await refreshToken();
}
```

### 2. Processo de Renovação

1. **Verificação**: Sistema verifica se há refresh token disponível
2. **Renovação**: Faz chamada para Microsoft usando o refresh token
3. **Atualização**: Salva o novo access token no .env e na memória
4. **Uso**: Retorna o novo token para uso imediato

### 3. Fallback em Caso de Erro

Se a renovação falhar:
- Sistema registra o erro nos logs
- Continua usando o token atual (pode estar expirado)
- Permite que a aplicação funcione temporariamente

## Vantagens

### Antes (Sistema Antigo)
❌ Tokens expiravam rapidamente (1 hora)
❌ Necessidade de re-autenticar manualmente
❌ Interrupções frequentes no serviço
❌ Token estático sem renovação

### Depois (Sistema com Refresh Tokens)
✅ Renovação automática e transparente
✅ Duração efetiva muito maior (90 dias de refresh)
✅ Sem interrupções no serviço
✅ Logging e monitoramento completo
✅ Fallback gracioso em caso de erro

## Troubleshooting

### Token Expirado sem Refresh Token

**Problema**: Access token expirou e não há refresh token
**Solução**: Execute nova autenticação

```bash
npm run auth:microsoft
```

### Client Secret Não Configurado

**Problema**: Renovação automática não funciona
**Solução**: Configure o `MICROSOFT_CLIENT_SECRET` no .env

### Refresh Token Inválido

**Problema**: Refresh token foi revogado ou expirou
**Solução**: Execute nova autenticação completa

### Verificar Logs

Os logs do sistema fornecem informações detalhadas:

```bash
# Logs mostram quando tokens são renovados
MicrosoftTokenService: Token expiring soon, attempting refresh
MicrosoftTokenService: Access token refreshed successfully
```

## Comandos Úteis

```bash
# Verificar status atual dos tokens
npm run auth:microsoft:status

# Executar nova autenticação
npm run auth:microsoft

# Ver versão compilada
npm run build

# Executar a aplicação
npm start
```

## Segurança

- ✅ Tokens são salvos apenas no arquivo .env local
- ✅ Client secrets não são expostos nos logs
- ✅ Refresh tokens são utilizados de forma segura
- ✅ Sistema segue as melhores práticas do OAuth2

## Monitoramento

O sistema fornece logs detalhados para monitoramento:

- 📊 Status de autenticação
- ⏰ Informações de expiração
- 🔄 Tentativas de renovação
- ❌ Erros e falhas
- ✅ Sucessos e atualizações
