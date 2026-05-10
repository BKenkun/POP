export enum PaymentMethods {
  Cash = 'cod_cash',
  Card = 'cod_card',
  Bizum = 'cod_bizum',
  PrepaidBizum = 'prepaid_bizum',
  PrepaidTransfer = 'prepaid_transfer',
  Stripe = 'stripe',
  Hilow = 'hilow'
}

export interface MonthlySelection {
    [key:string]: string; 
}

export enum StatusVariant {
  DEFAULT = 'default',
  SECONDARY = 'secondary',
  OUTLINE = 'outline',
  DESTRUCTIVE = 'destructive',
}

const STATUS_VARIANTS: Record<string, StatusVariant> = {
  delivered: StatusVariant.DEFAULT,
  entregado: StatusVariant.DEFAULT,

  shipped: StatusVariant.SECONDARY,
  enviado: StatusVariant.SECONDARY,

  pending: StatusVariant.OUTLINE,
  pendiente: StatusVariant.OUTLINE,
  'reserva recibida': StatusVariant.OUTLINE,
  'pago pendiente de verificación': StatusVariant.OUTLINE,

  cancelled: StatusVariant.DESTRUCTIVE,
  cancelado: StatusVariant.DESTRUCTIVE,
};

export const getStatusVariant = (
  status: string,
): StatusVariant => {
  return (
    STATUS_VARIANTS[status.trim().toLowerCase()] ??
    StatusVariant.SECONDARY
  );
};