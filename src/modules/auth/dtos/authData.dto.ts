import { ApiProperty } from "@nestjs/swagger";

export class AuthDataDto {
    @ApiProperty(
        { 
            example: 'eyJhbGciOiJIUzI' ,
            description: 'JWT Access Token valid for 15 minutes'
        }
    )
    accessToken: string;

    @ApiProperty(
        {
            example: 'eyJhbGciOiJIUzI',
            description: 'JWT Refresh Token valid for 7 days'
        }
    )
    refreshToken: string;

    @ApiProperty(
        {
            example: '2023-03-15T12:00:00Z',
            description: 'Refresh Token Expiry Date'
        }
    )
    refreshTokenExpiry: Date;

    @ApiProperty(
        {
            example: '2023-03-15T12:00:00Z',
            description: 'Access Token Expiry Date'
        }
    )
    accessTokenExpiry: Date;

    @ApiProperty(
        {
            example: 'user@example.com',
            description: 'User email address'
        }
    )
    email: string;

    @ApiProperty(
        {
            example: '123',
            description: 'User ID'
        }
    )
    userId: string;

    @ApiProperty(
        {
            example: '456',
            description: 'Session ID'
        }
    )
    sessionId: string;
}