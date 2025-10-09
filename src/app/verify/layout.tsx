
import { ReactNode } from 'react';

// This layout is intentionally empty to isolate the verification page
// from any global context providers that might cause conflicts.
export default function VerifyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
