import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from 'dotenv';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('SYS-HUB - REST API')
    .setDescription('REST API of SYS-HUB - A DNS Service')
    .setVersion('1.0')
    .setExternalDoc('JSON', 'api-json')
    .setBasePath('api/v1')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your API key'
      },
      'Auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'api-json',
    yamlDocumentUrl: 'api-yaml',
  });

  await app.listen(3000);
}
bootstrap();