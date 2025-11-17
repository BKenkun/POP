// This file has been deprecated and its logic moved to firestore-listener.ts
// The WebSocket connection was proving unreliable due to infrastructure issues (403 errors).
// The new system uses a real-time Firestore listener for order updates, which is more robust.
'use server';
console.log('[DEPRECATED] websocket-client.ts is no longer in use.');
