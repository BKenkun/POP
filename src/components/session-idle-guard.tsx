'use client';

import { useState } from 'react';
import { Clock, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import {
  formatRemainingClock,
  IDLE_WARNING_WINDOW_MS,
} from '@/lib/session-timeout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SessionIdleGuard() {
  const {
    user,
    isActualAdmin,
    isSessionWarningOpen,
    sessionRemainingMs,
    sessionTimeoutMs,
    extendSession,
    logout,
  } = useAuth();
  const [extending, setExtending] = useState(false);

  if (!user || !isSessionWarningOpen) {
    return null;
  }

  const formattedClock = formatRemainingClock(sessionRemainingMs);
  const progressValue = Math.min(
    100,
    Math.max(0, (sessionRemainingMs / IDLE_WARNING_WINDOW_MS) * 100)
  );
  const totalMinutes = Math.round(sessionTimeoutMs / 60000);

  const handleExtend = async () => {
    setExtending(true);
    try {
      await extendSession();
    } finally {
      setExtending(false);
    }
  };

  return (
    <Dialog open={isSessionWarningOpen}>
      <DialogContent
        className="sm:max-w-md"
        hideCloseButton={true}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl">
            Your session is about to expire
          </DialogTitle>
          <DialogDescription className="text-center">
            For security ({isActualAdmin ? 'administrator session' : 'user session'} · max{' '}
            {totalMinutes} min idle limit), your session will automatically close unless you confirm
            you are still active.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-3 rounded-lg border bg-muted/40 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Time remaining</span>
          </div>
          <div className="font-mono text-4xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {formattedClock}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => void logout({ reason: 'manual' })}
            disabled={extending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out now
          </Button>
          <Button type="button" onClick={handleExtend} disabled={extending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${extending ? 'animate-spin' : ''}`} />
            {extending ? 'Renewing...' : 'Keep session active'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
