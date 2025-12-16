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
import e, { Request } from 'express';
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

    async verifyOtp(verifyOtpDto: VerifyOtpDto, request: Request): Promise<AuthDataDto | { resetPasswordToken: string, userId: string }> {
        const { email, otp } = verifyOtpDto;
        const isValid = await this.otpService.verifyOtp(email, otp);

        if(!isValid) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        if(verifyOtpDto.verificationFlow == OtpFlow.REGISTRATION){
            const user = await this.usersService.updateUserEmailVerification(email);

            const session = await this.sessionService
            .createSession(request, user, "temp", 0); // temp token and 0 expiry for now

            const tokens = await this.createTokens(user.id.toString(), user.email, session.id);

            await this.sessionService.updateSessionRefreshToken(
                session.id,
                tokens.refreshToken.token,
                tokens.refreshToken.expiresIn
            );

            const auth : AuthDataDto = {
                accessToken: tokens.accessToken.token,
                refreshToken: tokens.refreshToken.token,
                refreshTokenExpiry: tokens.refreshTokenExpiry,
                accessTokenExpiry: tokens.accessTokenExpiry,
                email: user.email,
                userId: user.id,
                sessionId: session.id
            };

            return auth;
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
            tokens.refreshToken.id,
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

    async refreshToken(refreshToken: string): Promise<AuthDataDto> {
        const payload = await this.jwtService.isTokenValid(refreshToken, 'refresh');

        if (!payload) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const sessionId = payload.sessionId;

        const session = await this.sessionService.getSessionById(sessionId);

        if (!session) {
            throw new UnauthorizedException('Session not found');
        } else if (session.expires_at < new Date()) {
            throw new UnauthorizedException('Session has expired');
        }
        
        const tokens = await this.createTokens(payload.userId, payload.email, sessionId);

        await this.sessionService.updateSessionRefreshToken(
            sessionId,
            tokens.refreshToken.id,
            tokens.refreshToken.expiresIn
        );

        // block old refresh token
        // exp = 1766231820 (epoch time in seconds)
        const exp = payload.exp - Math.floor(Date.now() / 1000);
        await this.jwtService.revokeRefreshTokenByJti(payload.jti, exp);

        
        return {
            accessToken: tokens.accessToken.token,
            refreshToken: tokens.refreshToken.token ,
            refreshTokenExpiry: tokens.refreshTokenExpiry,
            accessTokenExpiry: tokens.accessTokenExpiry,
            email: payload.email,
            userId: payload.userId,
            sessionId: sessionId
        };
    }

    async logout(userId: string, sessionId: string, allDevices: boolean): Promise<void> {
        if (allDevices) {
           await this.sessionService.invalidateAllUserSessions(userId);
        } else {
            await this.sessionService.invalidateSession(sessionId, userId);
        }
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
