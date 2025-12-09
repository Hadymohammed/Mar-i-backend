import { Module } from '@nestjs/common';
import { typeormConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
        TypeOrmModule.forRoot(typeormConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
