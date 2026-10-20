export class FirestorePermissionError extends Error {
  override readonly name = 'FirestorePermissionError';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
