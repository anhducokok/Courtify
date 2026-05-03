import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';

export type SepayDirectBankPayload = {
  content?: string;
  transferType?: string;
  transferAmount?: number;
  id?: string;
  transaction_id?: string;
  transId?: string;
};

export type SepayCheckoutPayload = {
  description?: string;
  amount?: number;
  [key: string]: unknown;
};

@Injectable()
export class SepayWebhookService {
  private readonly logger = new Logger(SepayWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  assertWebhookAllowed(req: Request, rawBody: Buffer | undefined): void {
    const allowedIps = this.config.get<string[]>('payment.webhookAllowedIps');
    if (allowedIps?.length) {
      const ip = req.ip || req.socket.remoteAddress || '';
      if (!allowedIps.includes(ip)) {
        this.logger.warn(`Sepay webhook rejected IP ${ip}`);
        throw new ForbiddenException();
      }
    }

    const apiKey = this.config.get<string | undefined>('payment.webhookApiKey');
    if (apiKey) {
      const header = req.headers['x-sepay-webhook-key'];
      const received = Array.isArray(header) ? header[0] : header;
      if (received !== apiKey) {
        throw new UnauthorizedException('Invalid webhook key');
      }
    }

    const hmacSecret = this.config.get<string | undefined>(
      'payment.webhookHmacSecret',
    );
    if (hmacSecret && rawBody?.length) {
      const header = req.headers['x-sepay-signature'];
      const received = Array.isArray(header) ? header[0] : header;
      if (!received) {
        throw new UnauthorizedException('Missing signature');
      }
      const expected = createHmac('sha256', hmacSecret)
        .update(rawBody)
        .digest('hex');
      try {
        if (
          received.length !== expected.length ||
          !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
        ) {
          throw new UnauthorizedException('Invalid signature');
        }
      } catch {
        throw new UnauthorizedException('Invalid signature');
      }
    }
  }

  async handleDirectBankTransfer(
    body: SepayDirectBankPayload,
  ): Promise<{ ok: boolean }> {
    if (!body) return { ok: true };

    const { content, transferType, transferAmount } = body;

    if (!content || transferType !== 'in' || transferAmount == null) {
      return { ok: true };
    }

    const sepayTransId = body.transaction_id ?? body.transId ?? body.id ?? null;

    const tx = await this.prisma.walletTransaction.findFirst({
      where: {
        sepayOrderId: content,
        type: TransactionType.RENTAL_PENDING,
      },
    });

    if (!tx) return { ok: true };

    const updated = await this.prisma.walletTransaction.updateMany({
      where: {
        id: tx.id,
        status: TransactionStatus.PENDING,
      },
      data: {
        status: TransactionStatus.SUCCESS,
        confirmedAt: new Date(),
        ...(sepayTransId != null ? { sepayTransId } : {}),
        sepayRawData: body as Prisma.InputJsonValue,
      },
    });

    if (updated.count === 0) return { ok: true };

    const ratio = this.config.get<number>('payment.creditRatio') ?? 0.905;
    const credit = Number(tx.amount) * ratio;

    await this.prisma.wallet.update({
      where: { id: tx.walletId },
      data: {
        pendingBalance: { increment: credit },
      },
    });

    if (tx.bookingId) {
      await this.prisma.booking.update({
        where: { id: tx.bookingId },
        data: { status: BookingStatus.PENDING_CONFIRMATION },
      });
    }

    return { ok: true };
  }

  /**
   * Hosted checkout / sandbox-style payloads (description-based matching).
   * Extend with order-invoice mapping when moving beyond sandbox.
   */
  async handleCheckoutCallback(
    data: SepayCheckoutPayload,
  ): Promise<{ ok: boolean }> {
    this.logger.log('Sepay checkout webhook payload received');
    this.logger.debug(JSON.stringify(data, null, 2));

    if (!data) return { ok: false };

    const description: string = data.description ?? '';
    const match = description.match(/PAYIN_USER_(\w+)/);

    if (!match) {
      this.logger.warn('Checkout webhook: no user id token in description');
      return { ok: false };
    }

    // await this.walletService.payin(match[1], Number(data.amount ?? 0));
    return { ok: true };
  }
}
