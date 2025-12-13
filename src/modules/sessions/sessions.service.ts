import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/common/entities/session.entity';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { GeolocationService } from 'src/common/services/geolocation/geolocation.service';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(Session)
        private sessionsRepository: Repository<Session>,
        private geolocationService: GeolocationService,
    ) { }

    /**
     * Extract device name from user agent string
     * @param userAgent - The user agent string from the request
     * @returns A human-readable device name
     */
    private extractDeviceName(userAgent: string): string {
        if (!userAgent || userAgent === 'unknown') {
            return 'Unknown Device';
        }

        // Mobile devices
        if (/iPhone/i.test(userAgent)) return 'iPhone';
        if (/iPad/i.test(userAgent)) return 'iPad';
        if (/Android/i.test(userAgent)) {
            if (/Mobile/i.test(userAgent)) return 'Android Phone';
            return 'Android Tablet';
        }

        // Desktop browsers
        if (/Windows/i.test(userAgent)) return 'Windows PC';
        if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac';
        if (/Linux/i.test(userAgent)) return 'Linux PC';

        // Other devices
        if (/PlayStation/i.test(userAgent)) return 'PlayStation';
        if (/Xbox/i.test(userAgent)) return 'Xbox';
        if (/Smart-TV|SmartTV/i.test(userAgent)) return 'Smart TV';

        return 'Unknown Device';
    }

    /**
     * Create a new session for a user
     * @param request - The Express request object
     * @param user - The user for whom to create the session
     * @param refreshToken - The refresh token to store (will be hashed)
     * @param expiresIn - The expiration time in seconds
     * @returns The created session
     */
    async createSession(request: Request, user: User, refreshToken: string, expiresIn: number): Promise<Session> {
        const userAgent = request.headers['user-agent'] || 'unknown';
        const deviceName = this.extractDeviceName(userAgent);
        
        // Get IP address and location using GeolocationService
        const ipAddress = this.geolocationService.extractIpAddress(request);
        const location = await this.geolocationService.getLocationFromRequest(request);

        // Hash the refresh token before storing
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        // Calculate expiration date
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        const session = this.sessionsRepository.create({
            user,
            refresh_token_hash: refreshTokenHash,
            location,
            ip_address: ipAddress,
            device_name: deviceName,
            expires_at: expiresAt,
        });

        return this.sessionsRepository.save(session);
    }

    async updateSessionRefreshToken(sessionId: string, newRefreshToken: string, newExpiresIn: number): Promise<void> {
        const session = await this.sessionsRepository.findOne({ where: { id: sessionId } });
        if (!session) {
            throw new Error('Session not found');
        }

        // Hash the new refresh token
        const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
        session.refresh_token_hash = newRefreshTokenHash;
        session.expires_at = new Date(Date.now() + newExpiresIn * 1000);

        await this.sessionsRepository.save(session);
    }

    /**
     * Get all active sessions for a user
     * @param userId - The user ID
     * @returns Array of active sessions
     */
    async getUserSessions(userId: string): Promise<Session[]> {
        return this.sessionsRepository.find({
            where: { 
                user: { id: userId },
            },
            order: { created_at: 'DESC' },
        });
    }
}
