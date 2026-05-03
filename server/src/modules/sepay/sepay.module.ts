import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SepayService } from './sepay.service';
import { SepayController } from './sepay.controller';
import { SepayWebhookController } from './sepay-webhook.controller';
import { SepayWebhookService } from './sepay-webhook.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [SepayController, SepayWebhookController],
  providers: [SepayService, SepayWebhookService],
  exports: [SepayService],
})
export class SepayModule {}
