import {
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from './client';

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}