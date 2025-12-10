import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    UsersModule,
    CommonModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
