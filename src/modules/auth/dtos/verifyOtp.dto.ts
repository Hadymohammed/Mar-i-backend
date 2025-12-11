import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { OtpFlow } from "src/common/enums/otpFlow.enum";

export class VerifyOtpDto {
    @IsEmail()
    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
    @ApiProperty({ example: '123456' })
    otp: string;

    @IsEnum(OtpFlow)
    @ApiProperty({ example: OtpFlow.REGISTRATION})
    verificationFlow: OtpFlow;
}