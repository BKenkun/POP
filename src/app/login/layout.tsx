
import { ReactNode } from 'react';

// This layout is intentionally minimal. It doesn't render Header or Footer
// because the main AppLayout already handles that. This prevents duplication.
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
