'use server';

import { auth, db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
 * Securely manages user addresses. Can add, update, or delete an address.
 * All logic runs on the server.
 */
export async function manageUserAddress(action: 'add' | 'update' | 'delete', addressData: Partial<Address>) {
    const userId = await getUserIdFromSession();
    const userDocRef = doc(db, 'users', userId);

    try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User document not found.");
        }
        
        let currentAddresses: Address[] = userDoc.data().addresses || [];

        switch (action) {
            case 'add':
                if (!addressData.alias || !addressData.name || !addressData.street) throw new Error("Missing required address fields.");
                const newId = `addr_${Date.now()}`;
                let newAddress: Address = { ...addressData, id: newId, isDefault: addressData.isDefault || false } as Address;
                
                if (newAddress.isDefault) {
                    currentAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
                }
                currentAddresses.push(newAddress);
                break;

            case 'update':
                if (!addressData.id || !addressData.alias || !addressData.name) throw new Error("Missing ID or required fields for update.");
                if (addressData.isDefault) {
                    currentAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
                }
                currentAddresses = currentAddresses.map(addr => addr.id === addressData.id ? { ...addr, ...addressData } as Address : addr);
                break;

            case 'delete':
                if (!addressData.id) throw new Error("Missing ID for delete action.");
                currentAddresses = currentAddresses.filter(addr => addr.id !== addressData.id);
                break;
            
            default:
                throw new Error("Invalid action specified.");
        }

        // Ensure there's always a default address if addresses exist
        if (currentAddresses.length > 0 && !currentAddresses.some(addr => addr.isDefault)) {
            currentAddresses[0].isDefault = true;
        }

        await updateDoc(userDocRef, { addresses: currentAddresses });

        revalidatePath('/account/addresses');
        return { success: true, message: `Address successfully ${action}ed.` };

    } catch (error: any) {
        console.error(`Error during address action '${action}':`, error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}