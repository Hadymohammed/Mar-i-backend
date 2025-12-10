import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { OtpService } from 'src/common/services/otp.service';
import { OtpFlow } from 'src/common/enums/otpFlow.enum';
import { MailService } from 'src/common/services/mailer/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private otpService: OtpService,
        private mailerService: MailService,
    ) { }

    async RegisterUser(userDto: CreateUserDto) {
        const user = await this.usersService.createUser(userDto);
        let otp: string;
        try {
            otp = await this.otpService.createOtp(user.email, OtpFlow.REGISTRATION);
        } catch (error) {
            throw new HttpException(`Failed to generate OTP: ${error.message}`, HttpStatus.BAD_GATEWAY);
        }

        try {
            await this.mailerService.sendOtpEmail(user.email, user.first_name, otp);
        } catch (error) {
            throw new HttpException(`Failed to send OTP email: ${error.message}`, HttpStatus.BAD_GATEWAY);
        }

        return { message: 'User registered successfully. OTP sent to email.' };
    }



}
