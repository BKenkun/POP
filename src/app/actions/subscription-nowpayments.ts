

'use server';

// This file is now deprecated.
// The logic has been moved to a dedicated API route at src/app/api/nowpayments/create-subscription/route.ts
// This is to ensure that client-side authentication is used consistently, resolving session cookie issues.

export async function createNowPaymentsSubscription(): Promise<{ success: boolean; invoice_url?: string; error?: string }> {
    console.warn("DEPRECATED: createNowPaymentsSubscription server action called. Logic has moved to an API route.");
    return { 
        success: false, 
        error: 'This function is deprecated and should not be called. Use the API route instead.' 
    };
}
