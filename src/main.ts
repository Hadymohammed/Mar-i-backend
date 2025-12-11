import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './common/plugins/swagger.plugin';
import { ResponseInterceptor } from './common/interceptors/respons.interceptor';
import { GlobalExceptionFilter } from './common/filters/httpExeptionsFilter.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS
  app.enableCors();

  // swagger
  setupSwagger(app);
  
  await app.listen(3000,() => {
    console.log('Application is running on: http://localhost:3000');
  });
}
bootstrap();
