import { ApiProperty } from "@nestjs/swagger";

export class OtpGeneratingResultDto {
    @ApiProperty({ example: 3, description: 'Number of available OTP resends' })
    availableResends: number;
}