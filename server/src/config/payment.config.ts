import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  sepayMerchant: process.env.SEPAY_MERCHANT ?? '',
  sepaySecret: process.env.SEPAY_SECRET ?? '',
  sepaySandbox: process.env.SEPAY_SANDBOX !== 'false',
  clientBaseUrl: (process.env.CLIENT_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
  sepayCheckoutSuccessPath:
    process.env.SEPAY_CHECKOUT_SUCCESS_PATH ?? '/deposit/success',
  sepayCheckoutErrorPath:
    process.env.SEPAY_CHECKOUT_ERROR_PATH ?? '/deposit/error',
  sepayCheckoutCancelPath:
    process.env.SEPAY_CHECKOUT_CANCEL_PATH ?? '/deposit/cancel',
  creditRatio: Number(process.env.SEPAY_CREDIT_RATIO ?? '0.905'),
  /** If set, require this value in the `x-sepay-webhook-key` header. */
  webhookApiKey: process.env.SEPAY_WEBHOOK_API_KEY,
  /**
   * If set, require `x-sepay-signature` to equal hex HMAC-SHA256 of the
   * raw request body. Enable raw body for this route in production so the
   * digest matches SePay’s algorithm exactly.
   */
  webhookHmacSecret: process.env.SEPAY_WEBHOOK_HMAC_SECRET,
  webhookAllowedIps: (process.env.SEPAY_WEBHOOK_IP_ALLOWLIST ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
}));
