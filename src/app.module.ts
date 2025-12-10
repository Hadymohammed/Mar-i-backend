import { Module } from '@nestjs/common';
import { typeormConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
        TypeOrmModule.forRoot(typeormConfig),
        CommonModule,
        AuthModule,
        UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
