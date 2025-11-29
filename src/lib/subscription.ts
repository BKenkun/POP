
'use client';

import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface MonthlySelectionData {
    poppers: (string | null)[];
    accessory: string | null;
}

/**
 * Fetches the user's current monthly selection from Firestore.
 */
export async function getUserSelection(): Promise<MonthlySelectionData | null> {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated. Cannot get selection.");
        return null;
    }

    const selectionDocRef = doc(db, 'users', user.uid, 'subscriptions', 'monthly_selection');
    
    try {
        const docSnap = await getDoc(selectionDocRef);
        if (docSnap.exists()) {
            console.log("Found selection in Firestore.");
            const data = docSnap.data();
            // Basic validation
            if (data && Array.isArray(data.poppers) && 'accessory' in data) {
                return data as MonthlySelectionData;
            }
        }
    } catch (error) {
        console.error("Error fetching user selection from Firestore:", error);
    }
    
    console.log("No valid selection found in Firestore, returning null.");
    return null;
}

/**
 * Saves the user's monthly selection to Firestore.
 */
export async function saveUserSelection(selection: MonthlySelectionData): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated. Cannot save selection.");
        throw new Error("Authentication required to save selection.");
    }
    
    const selectionDocRef = doc(db, 'users', user.uid, 'subscriptions', 'monthly_selection');

    try {
        await setDoc(selectionDocRef, {
            ...selection,
            updatedAt: serverTimestamp(),
        });
        console.log("Successfully saved selection to Firestore.");
    } catch (error) {
        console.error("Error saving user selection to Firestore:", error);
        throw new Error("Failed to save selection to the database.");
    }
}
