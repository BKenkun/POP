import type { Metadata } from 'next';
import CheckoutClientPage from './checkout-client-page';

export const metadata: Metadata = {
  title: 'Complete Checkout',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClientPage />;
}
