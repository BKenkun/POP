'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { hilowFirebaseConfig } from './config';

const HILOW_APP_NAME = 'hilow-checkout';

const app = getApps().some(app => app.name === HILOW_APP_NAME)
  ? getApp(HILOW_APP_NAME)
  : initializeApp(hilowFirebaseConfig, HILOW_APP_NAME);

export const hilowDb = getFirestore(app);