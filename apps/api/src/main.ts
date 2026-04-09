import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: {
      origin: true,
      credentials: true
    }
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mestre Aluno API')
    .setDescription('API oficial da plataforma Mestre Aluno')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(Number(process.env.API_PORT ?? 3333));
}

bootstrap();
