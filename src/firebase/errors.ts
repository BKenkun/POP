export class FirestorePermissionError extends Error {
  constructor(message = 'No tienes permisos para acceder a este recurso.') {
    super(message);

    this.name = 'FirestorePermissionError';
  }
}