import * as bcrypt from 'bcrypt';
import { OtpFlow } from '../../enums/otpFlow.enum';
import { RedisService } from '../redis.service';
import { OtpRedisKeys } from '../../consts/otpRedisKeys.const';
import { OTP_MAX_RESENDS } from '../../consts/constants.const';
import { Injectable } from '@nestjs/common';
import { IOtpGeneratingResult } from './interfaces/IOtpGeneratingResult';

@Injectable()
export class OtpService {
    constructor(
        private readonly redisService: RedisService,
    ) {
    }

    private get redisClient() {
        return this.redisService.getClient();
    }

    private async generateOtp(): Promise<{ value: string; hashed: string }> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        return {
            value: otp,
            hashed: hashedOtp,
        };
    }

    async createOtp(email: string): Promise<IOtpGeneratingResult> {
        // OTP Constraints
        // 5 minutes validity
        // 30 seconds cooldown between requests
        // Maximum 3 resends within validity period
        // Block user for 5 minutes after 3 resends

        // check if user is blocked
        const isBlocked = await this.redisClient.GET(OtpRedisKeys.blocked(email));
        if (isBlocked) {
            throw new Error('User is temporarily blocked from requesting OTPs.');
        }

        const otp = await this.generateOtp();
        
        // check cooldown and resends 
        const cooldownKey = await this.redisClient.GET(OtpRedisKeys.coolDown(email));
        if (cooldownKey) {
            throw new Error('OTP request is in cooldown period.');
        }
        const resends = (await this.redisClient.GET(OtpRedisKeys.resends(email))) as string;

        if (parseInt(resends) > OTP_MAX_RESENDS) {
            await this.redisClient.SET(OtpRedisKeys.blocked(email), '1', { EX: 300 }); // Block for 5 minutes
            throw new Error('Maximum OTP resends reached.');
        }

        await this.redisClient.SET(OtpRedisKeys.value(email), otp.hashed, { EX: 300 }); // OTP valid for 5 minutes
        await this.redisClient.SET(OtpRedisKeys.coolDown(email), '1', { EX: 30 }); // Cooldown of 30 seconds
        await this.redisClient.INCR(OtpRedisKeys.resends(email));
        await this.redisClient.EXPIRE(OtpRedisKeys.resends(email), 300);

        return {
            value: otp.value,
            availableResends: OTP_MAX_RESENDS - (parseInt(resends) || 0),
        };
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const storedHashedOtp = await this.redisClient.GET(OtpRedisKeys.value(email));
        if (!storedHashedOtp) {
            return false; // OTP expired or does not exist
        }

        const isMatch = await bcrypt.compare(otp, storedHashedOtp);
        if (isMatch) {
            // OTP is valid, delete it from Redis
            await this.redisClient.DEL(OtpRedisKeys.value(email));
            await this.redisClient.DEL(OtpRedisKeys.resends(email));
            return true;
        } else {
            return false; // OTP does not match
        }
    }
}