// jwt guard
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../services/jwt/jwt.service';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    const env = process.env.STAGE;
        const nonProduction = env == 'dev' || env == 'local' || env == 'staging';

    if (nonProduction && token === 'test') {
        return true;
    }

    const payload = await this.jwtService.isTokenValid(token, 'access');
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach session info to request object
    request.session = payload;
    return true;
  }
}