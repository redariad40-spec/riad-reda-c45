import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import path from 'path';

async function bootstrap() {
  const port = process.env.PORT ?? 5000;
  const app = await NestFactory.create(AppModule);

  // ✅ خلي فولدر uploads متاح كـ static files
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  await app.listen(port, () => {
    console.log(`Server is running on port ${port} ✅🚀`);
  });
}

bootstrap();
