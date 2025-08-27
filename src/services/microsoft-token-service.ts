import { ConfidentialClientApplication, PublicClientApplication, ClientCredentialRequest, RefreshTokenRequest, AuthenticationResult } from '@azure/msal-node';
import { logInfo, logError, logWarn } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export interface MicrosoftTokenConfig {
  clientId: string;
  clientSecret?: string;
  tenantId: string;
  scopes: string[];
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
}

export class MicrosoftTokenService {
  private msalApp: ConfidentialClientApplication | PublicClientApplication;
  private config: MicrosoftTokenConfig;
  private tokenCache: TokenData | null = null;
  private readonly TOKEN_BUFFER_TIME = 5 * 60 * 1000; // 5 minutos antes da expiração
  private isPublicClient: boolean;

  constructor(config: MicrosoftTokenConfig) {
    this.config = config;
    this.isPublicClient = !config.clientSecret;
    
    if (this.isPublicClient) {
      // Aplicação pública (sem client_secret)
      this.msalApp = new PublicClientApplication({
        auth: {
          clientId: config.clientId,
          authority: `https://login.microsoftonline.com/${config.tenantId}`,
        }
      });
    } else {
      // Aplicação confidencial (com client_secret)
      this.msalApp = new ConfidentialClientApplication({
        auth: {
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          authority: `https://login.microsoftonline.com/${config.tenantId}`,
        }
      });
    }

    logInfo('MicrosoftTokenService', 'Initialized Microsoft Token Service', {
      clientId: config.clientId,
      tenantId: config.tenantId,
      hasClientSecret: !!config.clientSecret
    });

    // Carrega token existente do cache
    this.loadTokenFromEnv();
  }

  /**
   * Carrega token existente das variáveis de ambiente
   */
  private loadTokenFromEnv(): void {
    try {
      const accessToken = process.env.MS_GRAPH_TOKEN;
      const refreshToken = process.env.MS_GRAPH_REFRESH_TOKEN;
      const expiresAt = process.env.MS_GRAPH_TOKEN_EXPIRES_AT;

      if (accessToken && expiresAt) {
        this.tokenCache = {
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt),
          scopes: this.config.scopes
        };
        
        logInfo('MicrosoftTokenService', 'Loaded existing token from environment', {
          hasRefreshToken: !!refreshToken,
          expiresAt: new Date(parseInt(expiresAt)).toISOString()
        });
      }
    } catch (error) {
      logWarn('MicrosoftTokenService', 'Could not load token from environment', error as Error);
    }
  }

  /**
   * Salva o token nas variáveis de ambiente
   */
  private saveTokenToEnv(tokenData: TokenData): void {
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      // Atualiza ou adiciona as variáveis
      const updateEnvVar = (content: string, key: string, value: string): string => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
          return content.replace(regex, `${key}=${value}`);
        } else {
          return content + `\n${key}=${value}`;
        }
      };

      envContent = updateEnvVar(envContent, 'MS_GRAPH_TOKEN', tokenData.accessToken);
      envContent = updateEnvVar(envContent, 'MS_GRAPH_TOKEN_EXPIRES_AT', tokenData.expiresAt.toString());
      
      if (tokenData.refreshToken) {
        envContent = updateEnvVar(envContent, 'MS_GRAPH_REFRESH_TOKEN', tokenData.refreshToken);
      }

      fs.writeFileSync(envPath, envContent);
      
      // Atualiza as variáveis de ambiente do processo atual
      process.env.MS_GRAPH_TOKEN = tokenData.accessToken;
      process.env.MS_GRAPH_TOKEN_EXPIRES_AT = tokenData.expiresAt.toString();
      if (tokenData.refreshToken) {
        process.env.MS_GRAPH_REFRESH_TOKEN = tokenData.refreshToken;
      }

      logInfo('MicrosoftTokenService', 'Token saved to environment successfully');
    } catch (error) {
      logError('MicrosoftTokenService', 'Failed to save token to environment', error as Error);
    }
  }

  /**
   * Verifica se o token atual está próximo da expiração
   */
  private isTokenExpiringSoon(tokenData: TokenData): boolean {
    const now = Date.now();
    return (tokenData.expiresAt - now) <= this.TOKEN_BUFFER_TIME;
  }

  /**
   * Renova o token usando refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<TokenData | null> {
    try {
      logInfo('MicrosoftTokenService', 'Attempting to refresh access token');

      const refreshRequest: RefreshTokenRequest = {
        refreshToken,
        scopes: this.config.scopes,
      };

      const response = await this.msalApp.acquireTokenByRefreshToken(refreshRequest);
      
      if (response && response.accessToken) {
        const tokenData: TokenData = {
          accessToken: response.accessToken,
          refreshToken: refreshToken, // Mantém o refresh token original
          expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000), // 1 hora padrão
          scopes: this.config.scopes
        };

        logInfo('MicrosoftTokenService', 'Access token refreshed successfully', {
          expiresAt: new Date(tokenData.expiresAt).toISOString()
        });

        return tokenData;
      }
    } catch (error) {
      logError('MicrosoftTokenService', 'Failed to refresh access token', error as Error);
    }

    return null;
  }

  /**
   * Obtém um token válido, renovando se necessário
   */
  public async getValidToken(): Promise<string> {
    try {
      // Se não temos token em cache, tenta carregar das variáveis de ambiente
      if (!this.tokenCache) {
        this.loadTokenFromEnv();
      }

      // Se ainda não temos token, lança erro
      if (!this.tokenCache) {
        throw new Error('No access token available. Please run authentication first.');
      }

      // Verifica se o token está válido
      if (!this.isTokenExpiringSoon(this.tokenCache)) {
        logInfo('MicrosoftTokenService', 'Using cached access token');
        return this.tokenCache.accessToken;
      }

      // Token está expirando, tenta renovar
      if (this.tokenCache.refreshToken) {
        logInfo('MicrosoftTokenService', 'Token expiring soon, attempting refresh');
        
        const newTokenData = await this.refreshAccessToken(this.tokenCache.refreshToken);
        
        if (newTokenData) {
          this.tokenCache = newTokenData;
          this.saveTokenToEnv(newTokenData);
          return newTokenData.accessToken;
        }
      }

      // Se chegou até aqui, não conseguiu renovar
      logWarn('MicrosoftTokenService', 'Could not refresh token, using existing token');
      return this.tokenCache.accessToken;
    } catch (error) {
      logError('MicrosoftTokenService', 'Failed to get valid token', error as Error);
      throw error;
    }
  }

  /**
   * Define um novo token (usado durante o processo de autenticação)
   */
  public setToken(tokenData: TokenData): void {
    this.tokenCache = tokenData;
    this.saveTokenToEnv(tokenData);
    logInfo('MicrosoftTokenService', 'New token set successfully', {
      expiresAt: new Date(tokenData.expiresAt).toISOString(),
      hasRefreshToken: !!tokenData.refreshToken
    });
  }

  /**
   * Limpa o token do cache e das variáveis de ambiente
   */
  public clearToken(): void {
    this.tokenCache = null;
    
    // Remove das variáveis de ambiente
    delete process.env.MS_GRAPH_TOKEN;
    delete process.env.MS_GRAPH_REFRESH_TOKEN;
    delete process.env.MS_GRAPH_TOKEN_EXPIRES_AT;

    logInfo('MicrosoftTokenService', 'Token cleared from cache and environment');
  }

  /**
   * Obtém informações sobre o token atual
   */
  public getTokenInfo(): { hasToken: boolean; expiresAt?: Date; expiresIn?: number; hasRefreshToken: boolean } {
    if (!this.tokenCache) {
      return { hasToken: false, hasRefreshToken: false };
    }

    const now = Date.now();
    const expiresIn = Math.max(0, this.tokenCache.expiresAt - now);

    return {
      hasToken: true,
      expiresAt: new Date(this.tokenCache.expiresAt),
      expiresIn,
      hasRefreshToken: !!this.tokenCache.refreshToken
    };
  }
}

// Singleton instance
let tokenService: MicrosoftTokenService | null = null;

export function getMicrosoftTokenService(): MicrosoftTokenService {
  if (!tokenService) {
    const config: MicrosoftTokenConfig = {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
      scopes: [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Calendars.ReadWrite',
        'https://graph.microsoft.com/User.Read',
        'offline_access'
      ]
    };

    if (!config.clientId) {
      throw new Error('MICROSOFT_CLIENT_ID is required in environment variables');
    }

    tokenService = new MicrosoftTokenService(config);
  }

  return tokenService;
}
