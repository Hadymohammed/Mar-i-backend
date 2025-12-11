import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()    
    @Matches(/^[A-Za-z\u0600-\u06FF ]+$/, { message: 'First name can only contain alphabetic characters and white spaces' })
    @MinLength(2)
    @MaxLength(30)
    @ApiProperty({ example: 'عبدالهادي' })
    firstName: string;

    @IsString()
    @Matches(/^[A-Za-z\u0600-\u06FF ]+$/, { message: 'First name can only contain alphabetic characters and white spaces' })
    @MinLength(2)
    @MaxLength(30)
    @ApiProperty({ example: "محمد" })
    lastName: string;

    @IsString()
    @IsEmail()
    @ApiProperty({ example: "hady@example.com" })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password is too short. Minimum length is $constraint1 characters' })
    @MaxLength(20 , { message: 'Password is too long. Maximum length is $constraint1 characters' })
    // At least one letter, one special character and one number
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message: 'Password must contain at least one letter, one number and one special character',
    })
    @ApiProperty({ example: "P@ssw0rd"})
    password: string;
}