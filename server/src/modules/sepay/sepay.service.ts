import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AxiosResponse } from 'axios';
import {
  BookingStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { Prisma } from '@prisma/client';
import { SePayPgClient } from 'sepay-pg-node';
import { PrismaService } from '../../database/prisma.service';

interface SepayOrder {
  order_invoice_number?: string;
  order_amount?: number;
  order_status?: string;
  transaction_id?: string;
  [key: string]: unknown;
}

interface SepayOrderListResponse {
  data?: {
    data?: SepayOrder[];
  };
}

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Returns true when in API polling mode (local/development).
   */
  private isApiMode(): boolean {
    return this.config.get<string>('sepay.paymentMode') === 'api';
  }

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
    if (this.isApiMode()) return;

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
   * Poll SePay API for new transactions when in API mode (local/development).
   */
  @Cron('*/30 * * * * *')
  async pollSepayApi(): Promise<void> {
    if (!this.isApiMode()) return;

    this.logger.debug('Polling SePay API for new transactions...');

    const merchantId = this.config.get<string>('payment.sepayMerchant') ?? '';
    const secretKey = this.config.get<string>('payment.sepaySecret') ?? '';
    const sandbox = this.config.get<boolean>('payment.sepaySandbox') ?? true;

    const client = new SePayPgClient({
      env: sandbox ? 'sandbox' : 'production',
      merchant_id: merchantId,
      secret_key: secretKey,
    });

    try {
      const lookbackMinutes =
        this.config.get<number>('sepay.apiLookbackMinutes') ?? 15;
      const fromDate = new Date(Date.now() - lookbackMinutes * 60 * 1000);
      const fromCreatedAt = fromDate.toISOString().split('T')[0];

      const response = (await client.order.all({
        from_created_at: fromCreatedAt,
        per_page: 100,
      })) as AxiosResponse<SepayOrderListResponse>;

      const orders: SepayOrder[] = response.data?.data?.data ?? [];

      this.logger.debug(`SePay API returned ${orders.length} orders`);

      for (const order of orders) {
        const orderId = order.order_invoice_number;
        if (!orderId || order.order_status !== 'paid') continue;

        const pendingTx = await this.prisma.walletTransaction.findFirst({
          where: {
            sepayOrderId: orderId,
            type: TransactionType.RENTAL_PENDING,
            status: TransactionStatus.PENDING,
          },
        });

        if (!pendingTx) continue;

        if (pendingTx.sepayTransId) continue;

        const sepayTransId = order.transaction_id ?? null;
        const ratio = this.config.get<number>('payment.creditRatio') ?? 0.905;
        const credit = Number(pendingTx.amount) * ratio;

        await this.prisma.walletTransaction.update({
          where: { id: pendingTx.id },
          data: {
            status: TransactionStatus.SUCCESS,
            confirmedAt: new Date(),
            sepayTransId,
            sepayRawData: order as unknown as Prisma.InputJsonValue,
          },
        });

        await this.prisma.wallet.update({
          where: { id: pendingTx.walletId },
          data: {
            pendingBalance: { increment: credit },
          },
        });

        if (pendingTx.bookingId) {
          await this.prisma.booking.update({
            where: { id: pendingTx.bookingId },
            data: { status: BookingStatus.PENDING_CONFIRMATION },
          });
        }

        this.logger.log(
          `API mode: confirmed transaction ${pendingTx.id} via SePay ${sepayTransId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error polling SePay API:', error);
    }
  }

  /**
   * Daily reconciliation: broader sync in API mode, no-op in webhook mode.
   */
  @Cron('0 0 9 * * *')
  async reconcileMissedSepayEvents(): Promise<void> {
    if (!this.isApiMode()) {
      this.logger.debug(
        'Sepay reconciliation (webhook mode): no action needed',
      );
      return;
    }

    this.logger.log('Running daily SePay reconciliation in API mode...');

    const merchantId = this.config.get<string>('payment.sepayMerchant') ?? '';
    const secretKey = this.config.get<string>('payment.sepaySecret') ?? '';
    const sandbox = this.config.get<boolean>('payment.sepaySandbox') ?? true;

    const client = new SePayPgClient({
      env: sandbox ? 'sandbox' : 'production',
      merchant_id: merchantId,
      secret_key: secretKey,
    });

    try {
      const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const fromCreatedAt = fromDate.toISOString().split('T')[0];

      const response = (await client.order.all({
        from_created_at: fromCreatedAt,
        per_page: 500,
      })) as AxiosResponse<SepayOrderListResponse>;

      const orders: SepayOrder[] = response.data?.data?.data ?? [];

      let confirmed = 0;
      for (const order of orders) {
        const orderId = order.order_invoice_number;
        if (!orderId || order.order_status !== 'paid') continue;

        const alreadyDone = await this.prisma.walletTransaction.findFirst({
          where: {
            sepayOrderId: orderId,
            status: TransactionStatus.SUCCESS,
          },
        });
        if (alreadyDone) continue;

        const pendingTx = await this.prisma.walletTransaction.findFirst({
          where: {
            sepayOrderId: orderId,
            type: TransactionType.RENTAL_PENDING,
          },
        });

        if (!pendingTx) continue;

        const sepayTransId = order.transaction_id ?? null;
        const ratio = this.config.get<number>('payment.creditRatio') ?? 0.905;
        const credit = Number(pendingTx.amount) * ratio;

        await this.prisma.walletTransaction.update({
          where: { id: pendingTx.id },
          data: {
            status: TransactionStatus.SUCCESS,
            confirmedAt: new Date(),
            sepayTransId,
            sepayRawData: order as unknown as Prisma.InputJsonValue,
          },
        });

        await this.prisma.wallet.update({
          where: { id: pendingTx.walletId },
          data: { pendingBalance: { increment: credit } },
        });

        if (pendingTx.bookingId) {
          await this.prisma.booking.update({
            where: { id: pendingTx.bookingId },
            data: { status: BookingStatus.PENDING_CONFIRMATION },
          });
        }

        confirmed++;
      }

      this.logger.log(
        `SePay reconciliation: confirmed ${confirmed} transactions`,
      );
    } catch (error) {
      this.logger.error('Error during SePay reconciliation:', error);
    }
  }
}
