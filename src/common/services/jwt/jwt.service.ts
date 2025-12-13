import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/IJwtPayload';
import { sign, SignOptions, verify } from 'jsonwebtoken';
import { IJwtGeneratingResult } from './interfaces/IJwtGeneratingResult';
const ms = require('ms');


export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  private get _secret (): string {
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
   * Create an access token for a user
   * @param userId - The user's unique identifier
   * @param email - The user's email address
   * @returns A signed JWT access token
   */
  async createAccessToken(userId: string, email: string, sessionId: string): Promise<IJwtGeneratingResult> {
    const payload = {
      sub: userId,
      email,
      type: 'access',
      sessionId
    };

    const options: SignOptions = {
      expiresIn: this._accessExpiresIn,
    };


    return new Promise((resolve, reject) => {
        sign(payload, this._secret, options, (err, token) => {
            if (err) {
            return reject(err);
            }
            resolve({
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
    const payload = {
        sub: userId,
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
    decodeToken(token: string): JwtPayload {
        return verify(token, this._secret) as JwtPayload;
    }
}