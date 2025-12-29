/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config.js';
import * as crypto from 'node:crypto';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  app.setGlobalPrefix('api');
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  if (!(globalThis as any).crypto) {
    (globalThis as any).crypto = crypto;
  }
  const config = new DocumentBuilder()
    .setTitle('FleetNexa API')
    .setDescription('FleetNexa API documentation')
    .setVersion('1.0')
    .addTag('fleetnexa')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

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
      'x-admin-token',
    ],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
