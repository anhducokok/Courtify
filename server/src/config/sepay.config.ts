import { registerAs } from '@nestjs/config';

export default registerAs('sepay', () => ({
  /**
   * Payment verification strategy:
   * - 'api'      : Poll SePay API periodically (local / development)
   * - 'webhook'  : Receive push callbacks from SePay (production)
   */
  paymentMode: (process.env.SEPAY_PAYMENT_MODE ?? 'webhook') as
    | 'api'
    | 'webhook',

  /**
   * How often (in seconds) to poll SePay API when paymentMode is 'api'.
   * Default: 30 seconds.
   */
  apiPollingIntervalSeconds: Number(
    process.env.SEPAY_API_POLLING_INTERVAL ?? '30',
  ),

  /**
   * Look-back window (in minutes) when querying SePay API.
   * E.g. "10" means fetch transactions from the last 10 minutes.
   * Default: 15 minutes.
   */
  apiLookbackMinutes: Number(process.env.SEPAY_API_LOOKBACK ?? '15'),
}));
