import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { BlockchainModule } from '../blockchain/blockchain.module.js';

@Module({
  imports: [BlockchainModule],
  controllers: [HealthController],
})
export class HealthModule {}