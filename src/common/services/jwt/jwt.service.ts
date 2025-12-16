import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/IJwtPayload';
import { sign, SignOptions, verify } from 'jsonwebtoken';
import { IJwtGeneratingResult } from './interfaces/IJwtGeneratingResult';
import { RedisService } from '../redis.service';
import { v4 as uuidv4 } from 'uuid';
import { TokensBlacklistRedisKey } from 'src/common/consts/redisKeys';
const ms = require('ms');


export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {}

  private get _accessSecret (): string {
    return this.configService.get<string>('JWT_ACCESS_SECRET');
  }

  private get _refreshSecret (): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  /**
   * @returns access token expiration time in seconds
   */
  private get _accessExpiresIn (): number {
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN');
    return ms(expiresIn) / 1000;
  }

    /**
     * @returns refresh token expiration time in seconds
     */
  private get _refreshExpiresIn (): number {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN');
    return ms(expiresIn) / 1000;
  }

  /**
   * Create a unique identifier for the JWT
   * @returns A unique JWT ID
   */
  private createJwtId(): string {
    return uuidv4();
  }

  /**
   * Create an access token for a user
   * @param userId - The user's unique identifier
   * @param email - The user's email address
   * @returns A signed JWT access token
   */
  async createAccessToken(userId: string, email: string, sessionId: string): Promise<IJwtGeneratingResult> {
    const refreshTokenId = this.createJwtId();
    const payload = {
      jti:  refreshTokenId,
      userId: userId,
      email,
      type: 'access',
      sessionId
    };

    const options: SignOptions = {
      expiresIn: this._accessExpiresIn,
    };


    return new Promise((resolve, reject) => {
        sign(payload, this._accessSecret, options, (err, token) => {
            if (err) {
            return reject(err);
            }
            resolve({
                id: refreshTokenId,
                token,
                expiresIn: this._accessExpiresIn
            });
        });
    });
  }

  /**
   * Create a refresh token for a user
   * @param userId - The user's unique identifier
   * @param email - The user's email address
   * @returns A signed JWT refresh token
   */
  async createRefreshToken(userId: string, email: string, sessionId: string): Promise<IJwtGeneratingResult> {
    const refreshTokenId = this.createJwtId();
    const payload = {
        jti:  refreshTokenId,
        userId: userId,
        email,
        type: 'refresh',
        sessionId
    };
    const options: SignOptions = {
        expiresIn: this._refreshExpiresIn,
    };
    return new Promise((resolve, reject) => {
        sign(payload, this._refreshSecret, options, (err, token) => {
            if (err) {
            return reject(err);
            }
            resolve({
                id: refreshTokenId,
                token,
                expiresIn: this._refreshExpiresIn
            });
        });
    });
  }

  /**
   * Decode a JWT token without verifying its signature
   * @param token - The JWT token to decode
   * @returns The decoded token payload
   */
    decodeToken(token: string, type: 'access' | 'refresh'): JwtPayload {
        const secret = type === 'access' ? this._accessSecret : this._refreshSecret;
        return verify(token, secret) as JwtPayload;
    }

    /**
     * Check if a token is valid and not revoked
     * @param token - The JWT token to check
     * @returns The token payload if valid, otherwise null
     */
    async isTokenValid(token: string, type: 'access' | 'refresh'): Promise<JwtPayload> {
      try {
        const payload = this.decodeToken(token, type);
        const jti = payload.jti;
        
        const redisKey = type === 'access' ? TokensBlacklistRedisKey.accessToken(jti) : TokensBlacklistRedisKey.refreshToken(jti);
        const isRevoked = await this.redisService.get(redisKey);

        const isSessionRevoked  = await this.redisService.get(TokensBlacklistRedisKey.session(payload.sessionId))

        return isRevoked && isSessionRevoked ? null : payload;
      } catch (error) {
        return null;
      }
    }

    /**
     * Revoke a refresh token by storing its jti in Redis with expiration
     * @param jti - The JWT ID of the token to revoke
     * @param expiresIn - Expiration time in seconds
     */
    async revokeRefreshTokenByJti(jti: string, expiresIn: number): Promise<void> {
        await this.redisService.set(TokensBlacklistRedisKey.refreshToken(jti), 'revoked', expiresIn);
    }

    async revokeRefreshToken(token: string): Promise<void> {
        const payload = this.decodeToken(token, 'refresh');
        const jti = payload.jti;
        const exp = payload.exp - Math.floor(Date.now() / 1000);
        await this.revokeRefreshTokenByJti(jti, exp);
    }
    /**
     * Revoke an access token by storing its jti in Redis with expiration
     * @param jti - The JWT ID of the token to revoke
     * @param expiresIn - Expiration time in seconds
     */
    async revokeAccessTokenByJti(jti: string, expiresIn: number): Promise<void> {
        await this.redisService.set(TokensBlacklistRedisKey.accessToken(jti), 'revoked', expiresIn);
    }

    /**
     * Revoke an access token
     * @param token - The JWT access token to revoke
     * @returns void
     */
    async revokeAccessToken(token: string): Promise<void> {
        const payload = this.decodeToken(token, 'access');
        const jti = payload.jti;
        const exp = payload.exp - Math.floor(Date.now() / 1000);
        await this.revokeAccessTokenByJti(jti, exp);
    }
}