import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { OtpService } from 'src/common/services/otp/otp.service';
import { OtpFlow } from 'src/common/enums/otpFlow.enum';
import { MailService } from 'src/common/services/mailer/mail.service';
import { VerifyOtpDto } from './dtos/verifyOtp.dto';
import { OtpGeneratingResultDto } from './dtos/otpGeneratingResult.dto';
import { IOtpGeneratingResult } from 'src/common/services/otp/interfaces/IOtpGeneratingResult';
import { LoginRequestDto } from './dtos/loginRequest.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from 'src/common/services/jwt/jwt.service';
import { SessionsService } from '../sessions/sessions.service';
import { Request } from 'express';
import { AuthDataDto } from './dtos/authData.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private otpService: OtpService,
        private mailerService: MailService,
        private jwtService: JwtService,
        private sessionService: SessionsService,
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

    async login(loginRequestDto: LoginRequestDto,request: Request): Promise<AuthDataDto> {
        const { email, password } = loginRequestDto;
        const user = await this.usersService.isUserExists(email);

        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        if (!user.email_verified) {
            throw new UnauthorizedException('Email not verified');
        }

        const session = await this.sessionService
        .createSession(request, user, "temp", 0); // temp token and 0 expiry for now
        
        const tokens = await this.createTokens(user.id.toString(), user.email, session.id);

        await this.sessionService.updateSessionRefreshToken(
            session.id,
            tokens.refreshToken.token,
            tokens.refreshToken.expiresIn
        );
        
        return {
            accessToken: tokens.accessToken.token,
            refreshToken: tokens.refreshToken.token ,
            refreshTokenExpiry: tokens.refreshTokenExpiry,
            accessTokenExpiry: tokens.accessTokenExpiry,
            email: user.email,
            userId: user.id,
            sessionId: session.id
        };
    }

    private async createTokens(userId: string, email: string, sessionId: string) {
        const accessToken = await this.jwtService.createAccessToken(userId, email, sessionId);
        const refreshToken = await this.jwtService.createRefreshToken(userId, email, sessionId);

        return {
            accessToken,
            refreshToken,
            refreshTokenExpiry: new Date(Date.now() + refreshToken.expiresIn * 1000),
            accessTokenExpiry: new Date(Date.now() + accessToken.expiresIn * 1000),
            email: email,
            userId: userId
        };
    }

}
