import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend (temporarily allow all origins for debugging)
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  await app.listen(env.PORT);
  console.log(`Realtime API running on http://localhost:${env.PORT}`);
}

bootstrap();