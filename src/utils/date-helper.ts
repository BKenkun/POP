import { z } from 'zod';

// Helper function to handle different date types (Timestamp, Date, string)
export const dateSchema = z.preprocess((arg) => {
  if (arg instanceof Timestamp) {
    return arg.toDate();
  }
  if (typeof arg === 'string' || arg instanceof Date) {
    return new Date(arg);
  }
  // This handles the Firestore Admin SDK Timestamp which is an object with _seconds and _nanoseconds
  if (typeof arg === 'object' && arg !== null && '_seconds' in arg && '_nanoseconds' in arg) {
    return new Timestamp((arg as any)._seconds, (arg as any)._nanoseconds).toDate();
  }
  return undefined;
}, z.date({ required_error: "Invalid date" }));