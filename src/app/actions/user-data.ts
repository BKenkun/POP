
'use server';

import { auth, firestore as db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

interface Address {
    id: string;
    alias: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

import {
  SESSION_ACTIVITY_COOKIE_NAME,
  verifyActivityToken,
} from '@/lib/session-server';

/**
 * Securely gets the user's ID from the session cookie.
 * This is the single source of truth for server-side user authentication.
 * Throws an error if the user is not authenticated or if the session expired due to inactivity.
 */
export async function getUserIdFromSession(): Promise<string> {
    const cookieStore = cookies();
    const activityCookie = cookieStore.get(SESSION_ACTIVITY_COOKIE_NAME)?.value;
    let verifiedActivityUid: string | null = null;

    if (activityCookie) {
        const activityCheck = verifyActivityToken(activityCookie);
        if (!activityCheck.valid || activityCheck.expired) {
            throw new Error('Authentication failed: Session expired due to inactivity.');
        }
        verifiedActivityUid = activityCheck.payload?.uid || null;
    }

    const sessionCookie = cookieStore.get('session')?.value;
    if (sessionCookie) {
        try {
            const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
            if (verifiedActivityUid && verifiedActivityUid !== decodedClaims.uid) {
                throw new Error('Authentication failed: Session mismatch.');
            }
            return decodedClaims.uid;
        } catch {
            // Fall through to check session_id_token if present
        }
    }

    const fallbackToken = cookieStore.get('session_id_token')?.value;
    if (fallbackToken) {
        try {
            const decoded = await auth.verifyIdToken(fallbackToken);
            if (verifiedActivityUid && verifiedActivityUid !== decoded.uid) {
                throw new Error('Authentication failed: Session mismatch.');
            }
            return decoded.uid;
        } catch {
            throw new Error('Authentication failed: Invalid session.');
        }
    }

    throw new Error('Authentication required: No session cookie found.');
}


/**
 * Fetches the current user's document from Firestore.
 */
export async function getCurrentUser() {
    try {
        const userId = await getUserIdFromSession();
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error: any) {
        // Don't throw error if cookie is invalid/expired, just return null
        return null;
    }
}


/**
 * Securely manages user data, including addresses and loyalty points.
 * All logic runs on the server.
 */
export async function updateUser(action: 'add-address' | 'update-address' | 'delete-address' | 'update-points', data: Partial<Address & { pointsToAdd: number; id?: string }>) {
    const userId = await getUserIdFromSession();
    
    const userDocRef = db.collection('users').doc(userId);

    try {
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            throw new Error("User document not found.");
        }
        
        let currentAddresses: Address[] = userDoc.data()?.addresses || [];
        let updatePayload: { [key: string]: any } = {};

        switch (action) {
            case 'add-address':
                if (!data.alias || !data.name || !data.street) throw new Error("Missing required address fields.");
                const newId = `addr_${Date.now()}`;
                let newAddress: Address = { ...data, id: newId, isDefault: data.isDefault || false } as Address;
                
                if (newAddress.isDefault) {
                    currentAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
                }
                currentAddresses.push(newAddress);
                updatePayload.addresses = currentAddresses;
                break;

            case 'update-address':
                if (!data.id || !data.alias || !data.name) throw new Error("Missing ID or required fields for update.");
                if (data.isDefault) {
                    currentAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
                }
                currentAddresses = currentAddresses.map(addr => addr.id === data.id ? { ...addr, ...data } as Address : addr);
                 updatePayload.addresses = currentAddresses;
                break;

            case 'delete-address':
                if (!data.id) throw new Error("Missing ID for delete action.");
                currentAddresses = currentAddresses.filter(addr => addr.id !== data.id);
                updatePayload.addresses = currentAddresses;
                break;
            
            case 'update-points':
                 if (typeof data.pointsToAdd !== 'number' || data.pointsToAdd < 0) throw new Error("Invalid points value.");
                 // Use Firestore's atomic increment operation for safety
                 updatePayload.loyaltyPoints = FieldValue.increment(data.pointsToAdd);
                 break;

            default:
                throw new Error("Invalid action specified.");
        }

        // Address-specific logic
        if (action.includes('address')) {
            // Ensure there's always a default address if addresses exist
            if (currentAddresses.length > 0 && !currentAddresses.some(addr => addr.isDefault)) {
                currentAddresses[0].isDefault = true;
            }
             updatePayload.addresses = currentAddresses;
             revalidatePath('/account/addresses');
        }
        
        if (action === 'update-points') {
            revalidatePath('/account');
        }


        await userDocRef.update(updatePayload);
        
        // Fetch and return the updated user document
        const updatedDoc = await userDocRef.get();
        
        return { success: true, message: `User data updated successfully.`, user: updatedDoc.data() };

    } catch (error: any) {
        console.error(`Error during user update action '${action}':`, error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
