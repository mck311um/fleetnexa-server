import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://dev.rentnexa.com',
      'https://rentnexa.com',
      'https://dev.fleetnexa.com',
      'https://dev.app.fleetnexa.com',
      'https://app.fleetnexa.com',
      'https://fleetnexa.com',
      'https://admin.rentnexa.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-auth-token',
      'x-timestamp',
      'x-api-key',
      'x-signature',
    ],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
