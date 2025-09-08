import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('🚀 Starting Better Play Blockchain Listener...');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('🛑 SIGTERM received, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('🛑 SIGINT received, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`✅ Blockchain Listener started successfully on port ${port}`);
  logger.log(`📊 Health endpoints: http://localhost:${port}/health and http://localhost:${port}/health/inflight`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Blockchain Listener:', error);
  process.exit(1);
});