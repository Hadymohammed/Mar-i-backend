import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { OtpService } from './services/otp.service';
import { MailService } from './services/mailer/mail.service';

@Module({
    providers: [
        RedisService,
        OtpService,
        MailService,
    ],
    exports: [
        OtpService,
        MailService
    ]
})
export class CommonModule {}
