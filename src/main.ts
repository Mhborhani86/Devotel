import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  dotenv.config();
  const logger = new Logger('Bootstrap');
  try {    
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
    .setTitle('Job Offers API')
    .setDescription('The Job Offers API allows you to fetch job listings from multiple providers.')
    .setVersion('1.0')
    .addTag('job-offers')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
    await app.listen(process.env.PORT_NUMBER ?? 3000);
  } catch (error) {
    logger.error('Failed to connect Port Server Site', error.stack);
    throw new Error('Could not connect to Port server site.');
  }
}
bootstrap();
