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