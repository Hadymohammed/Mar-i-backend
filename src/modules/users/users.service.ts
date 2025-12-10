import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

    async isUserExists(email: string): Promise<User | null> {
        const user = await this.userRepo.findOne(
            { where: { email } }
        );
        return user;

    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        // check if user already exists
        const userExists = await this.isUserExists(userDto.email);
        if (userExists && userExists.email_verified) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }

        // hash password
        const hashedPassword: string = await bcrypt.hash(userDto.password, 10);
        
        // if user exists but not verified, update the user
        if (userExists && !userExists.email_verified) {
            userExists.first_name = userDto.firstName;
            userExists.last_name = userDto.lastName;
            userExists.password_hash = hashedPassword;
            return this.userRepo.save(userExists);
        } else {
            const newUser = this.userRepo.create({
                email: userDto.email,
                first_name: userDto.firstName,
                last_name: userDto.lastName,
                password_hash: hashedPassword,
            });
            return this.userRepo.save(newUser);
        }
    }
}
