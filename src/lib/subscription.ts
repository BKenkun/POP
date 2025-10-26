
'use client';

// THIS IS A MOCK/SIMULATED DATA SERVICE
// In a real application, this would interact with Firestore
// under db.collection('users').doc(userId).collection('subscriptions').doc('monthly')

export interface MonthlySelectionData {
    poppers: (string | null)[];
    accessory: string | null;
}

/**
 * Simulates fetching the user's current selection from a database.
 * Uses localStorage to persist the selection for demonstration purposes.
 */
export async function getUserSelection(): Promise<MonthlySelectionData | null> {
    console.log("Simulating fetching user selection...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    try {
        if (typeof window !== 'undefined') {
            const storedSelection = localStorage.getItem('monthly_selection');
            if (storedSelection) {
                const parsed = JSON.parse(storedSelection);
                // Basic validation
                if (Array.isArray(parsed.poppers) && 'accessory' in parsed) {
                    console.log("Found selection in localStorage:", parsed);
                    return parsed;
                }
            }
        }
    } catch (error) {
        console.error("Could not parse user selection from localStorage", error);
    }
    
    console.log("No valid selection found, returning null.");
    return null;
}

/**
 * Simulates saving the user's selection to a database.
 * Uses localStorage to persist the selection for demonstration purposes.
 */
export async function saveUserSelection(selection: MonthlySelectionData): Promise<void> {
    console.log("Simulating saving user selection:", selection);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem('monthly_selection', JSON.stringify(selection));
            console.log("Successfully saved selection to localStorage.");
        }
    } catch (error) {
        console.error("Could not save user selection to localStorage", error);
        throw new Error("Failed to save selection.");
    }
}
