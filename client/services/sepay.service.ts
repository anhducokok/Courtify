import type { AxiosInstance } from 'axios';

export interface SepayCheckoutResponse {
  initUrl: string;
  formFields: Record<string, unknown>;
}

export const sepayService = {
  async createCheckout(api: AxiosInstance, amount: number): Promise<SepayCheckoutResponse> {
    const { data } = await api.post<SepayCheckoutResponse>('/sepay/checkout', { amount });
    return data;
  },
};
