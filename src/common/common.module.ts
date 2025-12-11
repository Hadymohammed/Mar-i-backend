import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './services/redis.service';
import { OtpService } from './services/otp/otp.service';
import { MailService } from './services/mailer/mail.service';
import { JwtService } from './services/jwt/jwt.service';
import { GeolocationService } from './services/geolocation/geolocation.service';

@Module({
    providers: [
        RedisService,
        OtpService,
        MailService,
        JwtService,
        GeolocationService,
    ],
    exports: [
        OtpService,
        MailService,
        JwtService,
        GeolocationService,
    ]
})
export class CommonModule {}
