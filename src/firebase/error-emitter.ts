import type { FirestorePermissionError } from './errors';

type PermissionErrorListener = (error: FirestorePermissionError) => void;

class FirebaseErrorEmitter {
  private permissionErrorListeners = new Set<PermissionErrorListener>();

  on(event: 'permission-error', listener: PermissionErrorListener): void {
    if (event === 'permission-error') {
      this.permissionErrorListeners.add(listener);
    }
  }

  off(event: 'permission-error', listener: PermissionErrorListener): void {
    if (event === 'permission-error') {
      this.permissionErrorListeners.delete(listener);
    }
  }

  emit(event: 'permission-error', error: FirestorePermissionError): void {
    if (event === 'permission-error') {
      this.permissionErrorListeners.forEach((listener) => listener(error));
    }
  }
}

export const errorEmitter = new FirebaseErrorEmitter();
