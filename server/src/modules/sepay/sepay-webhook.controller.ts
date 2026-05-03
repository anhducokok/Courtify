import {
  Body,
  Controller,
  HttpCode,
  Post,
  RawBody,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from '../../common/decorators';
import {
  SepayWebhookService,
  type SepayCheckoutPayload,
  type SepayDirectBankPayload,
} from './sepay-webhook.service';

const webhookBodyPipe = new ValidationPipe({
  whitelist: false,
  forbidNonWhitelisted: false,
  transform: false,
});

@Controller('sepay/webhook')
@Public()
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 60, ttl: 60000 } })
@UsePipes(webhookBodyPipe)
export class SepayWebhookController {
  constructor(private readonly webhooks: SepayWebhookService) {}

  /** Pattern A: incoming bank transfer; match `content` to `sepayOrderId`. */
  @Post('direct')
  @HttpCode(200)
  async direct(
    @Req() req: Request,
    @RawBody() rawBody: Buffer | undefined,
    @Body() body: SepayDirectBankPayload,
  ) {
    this.webhooks.assertWebhookAllowed(req, rawBody);
    return this.webhooks.handleDirectBankTransfer(body);
  }

  /** Pattern B: hosted checkout / payment-page callbacks. */
  @Post('checkout')
  @HttpCode(200)
  async checkout(
    @Req() req: Request,
    @RawBody() rawBody: Buffer | undefined,
    @Body() body: SepayCheckoutPayload,
  ) {
    this.webhooks.assertWebhookAllowed(req, rawBody);
    return this.webhooks.handleCheckoutCallback(body);
  }
}
