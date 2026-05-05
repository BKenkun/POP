export enum UserSubscriptionStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  PastDue = 'past_due'
}

export interface UserSubscription {
    sub_id: string; 
    status: UserSubscriptionStatus;
}