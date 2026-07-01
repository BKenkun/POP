import { z } from 'zod';
import { OrderItemSchema } from './order-item.schema';
import { ShippingAddressSchema } from './shipping-address.schema';
import { PaymentMethods } from '@/types';
import { dateSchema } from '@/utils';

export enum OrderSchemaStatus {
  PendingPayment = 'pending_payment',
  PaymentFailed = 'payment_failed',
  OrderReceived = 'order_received',
  Shipped = 'shipped',
  OutForDelivery = 'out_for_delivery',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  Issue = 'issue'
}

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: dateSchema,
  status: z.nativeEnum(OrderSchemaStatus),
  total: z.number(),
  items: z.array(OrderItemSchema),
  customerName: z.string(),
  customerEmail: z.string().email(),
  shippingAddress: ShippingAddressSchema.nullable(),
  paymentMethod:  z.nativeEnum(PaymentMethods).optional(),
  path: z.string().optional(),
  deliveryDni: z.string().optional(),
  deliverySignature: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderStatus = Order['status'];
