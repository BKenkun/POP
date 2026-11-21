'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { UserSubscription } from '@/lib/types';
import { isAdminEmail } from '@/lib/admin';
import {
  ACTIVITY_THROTTLE_MS,
  getIdleTimeoutMs,
  IDLE_WARNING_WINDOW_MS,
  LAST_ACTIVITY_STORAGE_KEY,
  SESSION_EXPIRED_QUERY_PARAM,
  SESSION_HEARTBEAT_INTERVAL_MS,
  SESSION_OWNER_STORAGE_KEY,
  USER_IDLE_TIMEOUT_MS,
} from '@/lib/session-timeout';
import SessionIdleGuard from '@/components/session-idle-guard';

const ADMIN_VIEW_AS_CUSTOMER_KEY = 'admin_view_as_customer';

export interface LogoutOptions {
  reason?: 'manual' | 'inactivity';
}

interface AuthContextType {
  user: User | null;
  userDoc: any | null; // Full user document from Firestore
  setUserDoc: (doc: any) => void;
  loading: boolean;
  logout: (options?: LogoutOptions) => Promise<void>;
  extendSession: () => Promise<void>;
  sessionRemainingMs: number;
  sessionTimeoutMs: number;
  isSessionWarningOpen: boolean;
  isSubscribed: boolean;
  loyaltyPoints: number;
  isAdmin: boolean;
  isActualAdmin: boolean;
  isViewingAsCustomer: boolean;
  setIsViewingAsCustomer: (isViewing: boolean) => void;
  subscription: UserSubscription | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredActivityTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredActivity(uid: string, timestamp: number): void {
  try {
    localStorage.setItem(SESSION_OWNER_STORAGE_KEY, uid);
    localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(timestamp));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

function clearStoredActivity(): void {
  try {
    localStorage.removeItem(SESSION_OWNER_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewingAsCustomer, setViewingAsCustomer] = useState(false);
  const [sessionRemainingMs, setSessionRemainingMs] = useState<number>(USER_IDLE_TIMEOUT_MS);
  const [isSessionWarningOpen, setIsSessionWarningOpen] = useState(false);

  const router = useRouter();

  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleWriteRef = useRef<number>(0);
  const lastHeartbeatRef = useRef<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);
  const warningOpenRef = useRef<boolean>(false);
  const authSequenceRef = useRef<number>(0);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem(ADMIN_VIEW_AS_CUSTOMER_KEY);
      setViewingAsCustomer(storedState === 'true');
    } catch {
      setViewingAsCustomer(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      const seq = ++authSequenceRef.current;

      setUser(currentUser);
      if (currentUser) {
        isLoggingOutRef.current = false;
        const userDocRef = doc(db, 'users', currentUser.uid);
        void getDoc(userDocRef)
          .then((docSnap) => {
            if (authSequenceRef.current !== seq) return;
            if (docSnap.exists()) {
              setUserDoc(docSnap.data());
            } else {
              setUserDoc(null);
            }
            setLoading(false);
          })
          .catch(() => {
            if (authSequenceRef.current !== seq) return;
            setUserDoc(null);
            setLoading(false);
          });
      } else {
        setUserDoc(null);
        setIsSessionWarningOpen(false);
        warningOpenRef.current = false;
        clearStoredActivity();
        setLoading(false);
      }
    });

    return () => {
      authSequenceRef.current += 1;
      unsubscribeAuth();
    };
  }, []);

  const isActualAdmin = useMemo(() => {
    return isAdminEmail(user?.email);
  }, [user]);

  const isAdmin = useMemo(() => {
    return isActualAdmin && !isViewingAsCustomer;
  }, [isActualAdmin, isViewingAsCustomer]);

  const sessionTimeoutMs = useMemo(() => {
    return getIdleTimeoutMs(isActualAdmin);
  }, [isActualAdmin]);

  const isSubscribed = useMemo(() => userDoc?.isSubscribed || false, [userDoc]);
  const loyaltyPoints = useMemo(() => userDoc?.loyaltyPoints || 0, [userDoc]);
  const subscription = useMemo(() => userDoc?.subscription || null, [userDoc]);

  const logout = useCallback(
    async (options?: LogoutOptions) => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      const reason = options?.reason ?? 'manual';

      try {
        authSequenceRef.current += 1;
        setIsSessionWarningOpen(false);
        warningOpenRef.current = false;
        clearStoredActivity();
        try {
          localStorage.removeItem(ADMIN_VIEW_AS_CUSTOMER_KEY);
        } catch {
          // Ignore storage error
        }
        setViewingAsCustomer(false);

        await firebaseSignOut(auth);
        await fetch('/api/logout', { method: 'POST' }).catch(() => undefined);

        if (reason === 'inactivity') {
          router.push(`/login?${SESSION_EXPIRED_QUERY_PARAM}=1`);
        } else {
          router.push('/');
        }
        router.refresh();
      } catch (error) {
        console.error('Error signing out:', error);
      } finally {
        isLoggingOutRef.current = false;
      }
    },
    [router]
  );

  const logoutRef = useRef(logout);
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const sendServerHeartbeat = useCallback(async (force = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const now = Date.now();
    if (!force && now - lastHeartbeatRef.current < SESSION_HEARTBEAT_INTERVAL_MS) {
      return;
    }

    lastHeartbeatRef.current = now;
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/session/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.status === 401) {
        const data = await res.json().catch(() => null);
        if (data?.status === 'expired') {
          await logoutRef.current({ reason: 'inactivity' });
        }
      }
    } catch {
      // Non-fatal network error; client idle clock still enforces timeout
    }
  }, []);

  const extendSession = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const now = Date.now();
    lastActivityRef.current = now;
    lastThrottleWriteRef.current = now;
    warningOpenRef.current = false;
    setIsSessionWarningOpen(false);
    setSessionRemainingMs(sessionTimeoutMs);
    writeStoredActivity(currentUser.uid, now);
    await sendServerHeartbeat(true);
  }, [sendServerHeartbeat, sessionTimeoutMs]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setSessionRemainingMs(USER_IDLE_TIMEOUT_MS);
      setIsSessionWarningOpen(false);
      warningOpenRef.current = false;
      return;
    }

    const now = Date.now();
    const storedOwner = (() => {
      try {
        return localStorage.getItem(SESSION_OWNER_STORAGE_KEY);
      } catch {
        return null;
      }
    })();
    const storedLastActivity = readStoredActivityTimestamp();
    const lastSignInMs = user?.metadata?.lastSignInTime
      ? Date.parse(user.metadata.lastSignInTime)
      : 0;

    // Reset clock on fresh sign-in or first tracked session for this user
    if (
      storedOwner !== uid ||
      !storedLastActivity ||
      (Number.isFinite(lastSignInMs) && lastSignInMs > storedLastActivity)
    ) {
      lastActivityRef.current = now;
      lastThrottleWriteRef.current = now;
      writeStoredActivity(uid, now);
      setSessionRemainingMs(sessionTimeoutMs);
      setIsSessionWarningOpen(false);
      warningOpenRef.current = false;
      void sendServerHeartbeat(true);
    } else {
      const elapsed = now - storedLastActivity;
      if (elapsed >= sessionTimeoutMs) {
        void logoutRef.current({ reason: 'inactivity' });
        return;
      }
      lastActivityRef.current = storedLastActivity;
      const remaining = Math.max(0, sessionTimeoutMs - elapsed);
      setSessionRemainingMs(remaining);
      const shouldWarn = remaining <= IDLE_WARNING_WINDOW_MS;
      warningOpenRef.current = shouldWarn;
      setIsSessionWarningOpen(shouldWarn);
    }

    const recordActivity = () => {
      if (isLoggingOutRef.current) return;
      // Once the warning dialog is visible, require explicit confirmation button click
      if (warningOpenRef.current) return;

      const currentTs = Date.now();
      if (currentTs - lastThrottleWriteRef.current < ACTIVITY_THROTTLE_MS) {
        return;
      }

      lastThrottleWriteRef.current = currentTs;
      lastActivityRef.current = currentTs;
      writeStoredActivity(uid, currentTs);
      setSessionRemainingMs(sessionTimeoutMs);

      if (currentTs - lastHeartbeatRef.current >= SESSION_HEARTBEAT_INTERVAL_MS) {
        void sendServerHeartbeat(false);
      }
    };

    const syncClock = () => {
      if (isLoggingOutRef.current) return;

      const storedTs = readStoredActivityTimestamp();
      const effectiveLastActivity =
        storedTs && storedTs > lastActivityRef.current
          ? storedTs
          : lastActivityRef.current;
      lastActivityRef.current = effectiveLastActivity;

      const elapsed = Date.now() - effectiveLastActivity;
      const remaining = Math.max(0, sessionTimeoutMs - elapsed);
      setSessionRemainingMs(remaining);

      if (remaining <= 0) {
        void logoutRef.current({ reason: 'inactivity' });
        return;
      }

      const shouldWarn = remaining <= IDLE_WARNING_WINDOW_MS;
      if (shouldWarn !== warningOpenRef.current) {
        warningOpenRef.current = shouldWarn;
        setIsSessionWarningOpen(shouldWarn);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_STORAGE_KEY && event.newValue) {
        const parsed = Number(event.newValue);
        if (Number.isFinite(parsed) && parsed > lastActivityRef.current) {
          lastActivityRef.current = parsed;
          const remaining = Math.max(0, sessionTimeoutMs - (Date.now() - parsed));
          setSessionRemainingMs(remaining);
          if (remaining > IDLE_WARNING_WINDOW_MS && warningOpenRef.current) {
            warningOpenRef.current = false;
            setIsSessionWarningOpen(false);
          }
        }
      } else if (event.key === SESSION_OWNER_STORAGE_KEY && event.newValue === null) {
        // Another tab logged out
        void logoutRef.current({ reason: 'manual' });
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncClock();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart',
    ];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const intervalId = window.setInterval(syncClock, 1000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, recordActivity);
      });
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.clearInterval(intervalId);
    };
  }, [user?.uid, user?.metadata?.lastSignInTime, sessionTimeoutMs, sendServerHeartbeat]);

  const handleSetIsViewingAsCustomer = (isViewing: boolean) => {
    if (isActualAdmin) {
      localStorage.setItem(ADMIN_VIEW_AS_CUSTOMER_KEY, isViewing.toString());
      setViewingAsCustomer(isViewing);
    }
  };

  const value = {
    user,
    userDoc,
    setUserDoc,
    loading,
    logout,
    extendSession,
    sessionRemainingMs,
    sessionTimeoutMs,
    isSessionWarningOpen,
    isSubscribed,
    loyaltyPoints,
    isAdmin,
    isActualAdmin,
    isViewingAsCustomer,
    setIsViewingAsCustomer: handleSetIsViewingAsCustomer,
    subscription,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionIdleGuard />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
