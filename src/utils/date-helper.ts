import { z } from 'zod';

export const dateSchema = z.preprocess((arg) => {
  // Firestore Timestamp (client o admin SDK)
  if (
    typeof arg === 'object' &&
    arg !== null &&
    'toDate' in arg &&
    typeof (arg as any).toDate === 'function'
  ) {
    return (arg as any).toDate();
  }

  // Date nativo
  if (arg instanceof Date) {
    return arg;
  }

  // String ISO
  if (typeof arg === 'string') {
    return new Date(arg);
  }

  // Firestore serializado
  if (
    typeof arg === 'object' &&
    arg !== null &&
    '_seconds' in arg
  ) {
    return new Date((arg as any)._seconds * 1000);
  }

  return undefined;
}, z.date());