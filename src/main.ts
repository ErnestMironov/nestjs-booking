import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  fs.mkdirSync('data', { recursive: true });

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  /** Глобальная валидация входящих DTO */
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  /** Исключает поля с @Exclude() из ответов (например, password_hash) */
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
