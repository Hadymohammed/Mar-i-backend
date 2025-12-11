import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { OtpService } from 'src/common/services/otp/otp.service';
import { OtpFlow } from 'src/common/enums/otpFlow.enum';
import { MailService } from 'src/common/services/mailer/mail.service';
import { VerifyOtpDto } from './dtos/verifyOtp.dto';
import { OtpGeneratingResultDto } from './dtos/otpGeneratingResult.dto';
import { IOtpGeneratingResult } from 'src/common/services/otp/interfaces/IOtpGeneratingResult';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private otpService: OtpService,
        private mailerService: MailService,
    ) { }

    async RegisterUser(userDto: CreateUserDto): Promise<number> {
        const user = await this.usersService.createUser(userDto);
        let otp: IOtpGeneratingResult;
        try {
            otp = await this.otpService.createOtp(user.email);
        } catch (error) {
            throw new HttpException(`Failed to generate OTP: ${error.message}`, HttpStatus.BAD_REQUEST);
        }

        try {
            await this.mailerService.sendOtpEmail(user.email, user.first_name, otp.value);
        } catch (error) {
            throw new HttpException(`Failed to send OTP email: ${error.message}`, HttpStatus.BAD_REQUEST);
        }

        return otp.availableResends;
    }

    async generateOtp(email: string): Promise<number> {
        const user = await this.usersService.isUserExists(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        let otp: IOtpGeneratingResult;

         try {
            otp = await this.otpService.createOtp(user.email);
        } catch (error) {
            throw new BadRequestException(`Failed to generate OTP: ${error.message}`);
        }

        try {
            await this.mailerService.sendOtpEmail(user.email, user.first_name, otp.value);
        } catch (error) {
            throw new BadRequestException(`Failed to send OTP email: ${error.message}`);
        }

        return otp.availableResends
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const { email, otp } = verifyOtpDto;
        const isValid = await this.otpService.verifyOtp(email, otp);

        if(!isValid) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        if(verifyOtpDto.verificationFlow == OtpFlow.REGISTRATION){
            const user = await this.usersService.updateUserEmailVerification(email);
            // generate login tokens
            return {
                accessToken: 'access',
                refreshToken: 'refresh',
                email: user.email,
                userId: user.id,
                refreshTokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hour
                accessTokenExpiry: new Date(Date.now() + 300 * 1000) // 5 minutes
            }
        } else {
            // generate reset password token
            return {
                resetPasswordToken: 'token',
                userId: 'id'
            }
        }
    }


}
