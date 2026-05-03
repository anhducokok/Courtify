import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { TransactionStatus } from '@prisma/client';
import { SePayPgClient } from 'sepay-pg-node';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  createCheckout(
    userId: string,
    amount: number,
  ): { initUrl: string; formFields: Record<string, unknown> } {
    const merchantId = this.config.get<string>('payment.sepayMerchant') ?? '';
    const secretKey = this.config.get<string>('payment.sepaySecret') ?? '';
    const sandbox = this.config.get<boolean>('payment.sepaySandbox') ?? true;
    const base = this.config.get<string>('payment.clientBaseUrl') ?? '';
    const successPath =
      this.config.get<string>('payment.sepayCheckoutSuccessPath') ?? '';
    const errorPath =
      this.config.get<string>('payment.sepayCheckoutErrorPath') ?? '';
    const cancelPath =
      this.config.get<string>('payment.sepayCheckoutCancelPath') ?? '';

    const client = new SePayPgClient({
      env: sandbox ? 'sandbox' : 'production',
      merchant_id: merchantId,
      secret_key: secretKey,
    });

    const orderId = `INV_${Date.now()}`;
    const formFields = client.checkout.initOneTimePaymentFields({
      order_invoice_number: orderId,
      order_amount: amount,
      currency: 'VND',
      order_description: `Nạp ví cho user ${userId}`,
      success_url: `${base}${successPath}?orderId=${encodeURIComponent(orderId)}`,
      error_url: `${base}${errorPath}?orderId=${encodeURIComponent(orderId)}`,
      cancel_url: `${base}${cancelPath}?orderId=${encodeURIComponent(orderId)}`,
      customer_id: userId,
    });

    return {
      initUrl: client.checkout.initCheckoutUrl(),
      formFields,
    };
  }

  /** Drop stale pending wallet rows (no payment arrived). */
  @Cron('0 */15 * * * *')
  async removePendingTransactions(): Promise<void> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const deleted = await this.prisma.walletTransaction.deleteMany({
      where: {
        status: TransactionStatus.PENDING,
        createdAt: { lt: fifteenMinutesAgo },
      },
    });

    if (deleted.count > 0) {
      this.logger.log(
        `Deleted ${deleted.count} pending wallet transactions older than 15 minutes`,
      );
    }
  }

  /**
   * Hook for daily reconciliation against Sepay’s transaction list API.
   * Implement when API credentials and idempotency keys are finalized.
   */
  @Cron('0 0 9 * * *')
  reconcileMissedSepayEvents(): void {
    this.logger.debug(
      'Sepay reconciliation cron: implement API list + idempotent confirm',
    );
  }
}
