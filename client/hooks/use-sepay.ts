'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/axios';
import { sepayService } from '@/services/sepay.service';
import { useBooking } from '@/components/booking/booking-context';

export interface SepayCheckoutData {
  initUrl: string;
  formFields: Record<string, unknown>;
  orderId?: string;
}

export function useSepayCheckout() {
  const api = useApiClient();
  const { state, setBookingId } = useBooking();
  const [checkoutData, setCheckoutData] = useState<SepayCheckoutData | null>(null);

  const mutation = useMutation({
    mutationFn: (amount: number) => sepayService.createCheckout(api, amount),
    onSuccess: (data) => {
      // Extract orderId from formFields if available
      const orderId = (data.formFields.order_invoice_number as string) || undefined;
      setCheckoutData({ ...data, orderId });

      // Store orderId in booking context for later reference
      if (orderId) {
        setBookingId(orderId);
      }
    },
  });

  const initiateCheckout = (amount: number) => {
    mutation.mutate(amount);
  };

  const clearCheckout = () => {
    setCheckoutData(null);
    mutation.reset();
  };

  return {
    checkoutData,
    isLoading: mutation.isPending,
    error: mutation.error,
    initiateCheckout,
    clearCheckout,
  };
}

/**
 * Hook to handle Sepay redirect callbacks.
 * Parses URL params from SePay redirect and triggers confirmation.
 */
export function useSepayRedirect() {
  const [redirectStatus, setRedirectStatus] = useState<'success' | 'error' | 'cancel' | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const orderIdParam = params.get('orderId');

    if (orderIdParam) {
      setOrderId(orderIdParam);
    }

    if (status === 'success') {
      setRedirectStatus('success');
    } else if (status === 'error') {
      setRedirectStatus('error');
    } else if (status === 'cancel') {
      setRedirectStatus('cancel');
    }
  }, []);

  const clearStatus = () => {
    setRedirectStatus(null);
    setOrderId(null);
  };

  return {
    redirectStatus,
    orderId,
    clearStatus,
  };
}
