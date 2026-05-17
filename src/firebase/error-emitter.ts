import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': FirestorePermissionError;
};

class TypedEventEmitter {
  private listeners: {
    [K in keyof Events]?: Array<(payload: Events[K]) => void>;
  } = {};

  on<K extends keyof Events>(
    event: K,
    callback: (payload: Events[K]) => void
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event]!.push(callback);
  }

  off<K extends keyof Events>(
    event: K,
    callback: (payload: Events[K]) => void
  ) {
    this.listeners[event] = this.listeners[event]?.filter(
      listener => listener !== callback
    );
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners[event]?.forEach(listener => listener(payload));
  }
}

export const errorEmitter = new TypedEventEmitter();