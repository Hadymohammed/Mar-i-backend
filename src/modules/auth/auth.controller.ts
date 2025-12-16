import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dtos/verifyOtp.dto';
import { OtpGeneratingResultDto } from './dtos/otpGeneratingResult.dto';
import { LoginRequestDto } from './dtos/loginRequest.dto';
import { Request } from 'express';
import { AuthDataDto } from './dtos/authData.dto';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { AUTH_NAME } from 'src/common/plugins/swagger.plugin';
import { IAuthRequest } from 'src/common/interfaces/IAuthRequest';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 200, description: 'User registered successfully.', type: OtpGeneratingResultDto })
  async register(@Body() userDto: CreateUserDto): Promise<OtpGeneratingResultDto> {
    const availableResends = await this.authService.RegisterUser(userDto);
    return { availableResends }
  }

  @Get('otp/generate')
  @ApiResponse({ status: 200, description: 'OTP generated successfully.', type: OtpGeneratingResultDto })
  async generateOtp(@Query('email') email: string): Promise<OtpGeneratingResultDto> {
    const availableResends = await this.authService.generateOtp(email);
    return { availableResends };
  }
  
  @Post('otp/verify')
  @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Req() request: Request): Promise<any> {
    const data = await this.authService.verifyOtp(verifyOtpDto, request);
    return data;
  }

  @Post('login')
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  async login(@Body() loginRequestDto: LoginRequestDto, @Req() request: Request): Promise<AuthDataDto> {
    const data = await this.authService.login(loginRequestDto, request);
    return data;
  }

  @Post('refresh-token')
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  async refreshToken(@Query('refreshToken') refreshToken: string): Promise<AuthDataDto> {
    const data = await this.authService.refreshToken(refreshToken);
    return data;
  }

  @Post('logout')
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  @UseGuards(JwtGuard)
  @ApiBearerAuth(AUTH_NAME)
  async logout(@Req() request: IAuthRequest,@Query('allDevices') allDevices: boolean = false): Promise<void> {
    await this.authService.logout(
      request.session.userId, 
      request.session.sessionId,
      allDevices);
  }
}
