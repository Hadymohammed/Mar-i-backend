import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dtos/verifyOtp.dto';
import { Result } from 'src/common/types/result.type';
import { OtpGeneratingResultDto } from './dtos/otpGeneratingResult.dto';

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
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    const data = await this.authService.verifyOtp(verifyOtpDto);
    return data;
  }
}
