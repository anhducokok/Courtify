'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface BookingState {
  court: {
    venueName: string;
    courtName: string;
    address: string;
    date: string;
    time: string;
    duration: string;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
    note: string;
    saveInfo: boolean;
  };
  payment: {
    method: 'momo' | 'vnpay' | 'cash';
    promoCode: string;
    promoDiscount: number;
  };
  pricing: {
    subtotal: number;
    serviceFee: number;
    total: number;
  };
}

interface BookingContextValue {
  state: BookingState;
  updateCourt: (court: Partial<BookingState['court']>) => void;
  updateContact: (contact: Partial<BookingState['contact']>) => void;
  updatePayment: (payment: Partial<BookingState['payment']>) => void;
}

const defaultState: BookingState = {
  court: {
    venueName: 'Sân Cầu Lông Hưng Dũng',
    courtName: 'Sân A2',
    address: '12 Lê Duẩn, Vinh',
    date: 'Thứ 5, 24/04/2025',
    time: '16:00 – 17:00',
    duration: '1 giờ',
  },
  contact: {
    name: 'Nguyễn Văn A',
    phone: '0901 234 567',
    email: '',
    note: '',
    saveInfo: true,
  },
  payment: {
    method: 'momo',
    promoCode: '',
    promoDiscount: 0,
  },
  pricing: {
    subtotal: 80_000,
    serviceFee: 5_000,
    total: 85_000,
  },
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(defaultState);

  const updateCourt = (court: Partial<BookingState['court']>) =>
    setState((s) => ({ ...s, court: { ...s.court, ...court } }));

  const updateContact = (contact: Partial<BookingState['contact']>) =>
    setState((s) => ({ ...s, contact: { ...s.contact, ...contact } }));

  const updatePayment = (payment: Partial<BookingState['payment']>) =>
    setState((s) => ({ ...s, payment: { ...s.payment, ...payment } }));

  return (
    <BookingContext.Provider value={{ state, updateCourt, updateContact, updatePayment }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be inside BookingProvider');
  return ctx;
}
