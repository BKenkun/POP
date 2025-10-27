'use server';

import { auth, firestore as db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

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

interface UserUpdateData {
    addresses?: Address[];
    loyaltyPoints?: number;
}


/**
 * Decodes the session cookie to get the authenticated user's ID.
 * Throws an error if the user is not authenticated.
 */
async function getUserIdFromSession(): Promise<string> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        throw new Error('Authentication required: No session cookie found.');
    }
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        return decodedClaims.uid;
    } catch (error) {
        console.error('Error verifying session cookie in server action:', error);
        throw new Error('Authentication failed: Invalid session.');
    }
}

/**
 * Fetches the current user's document from Firestore.
 */
export async function getCurrentUser() {
    try {
        const userId = await getUserIdFromSession();
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error: any) {
        console.error("Error fetching current user:", error);
        // Don't expose internal errors to the client
        if (error.message.includes('Authentication')) {
            throw error;
        }
        return null;
    }
}


/**
 * Securely manages user data, including addresses and loyalty points.
 * All logic runs on the server.
 */
export async function updateUser(action: 'add-address' | 'update-address' | 'delete-address' | 'update-points', data: Partial<Address & { pointsToAdd: number }>) {
    const userId = await getUserIdFromSession();
    const userDocRef = doc(db, 'users', userId);

    try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User document not found.");
        }
        
        let currentAddresses: Address[] = userDoc.data().addresses || [];
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
                 updatePayload.loyaltyPoints = increment(data.pointsToAdd);
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


        await updateDoc(userDocRef, updatePayload);
        
        // Fetch and return the updated user document
        const updatedDoc = await getDoc(userDocRef);
        
        return { success: true, message: `User data updated successfully.`, user: updatedDoc.data() };

    } catch (error: any) {
        console.error(`Error during user update action '${action}':`, error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
