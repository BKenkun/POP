
import { ReactNode } from 'react';

// Este layout está intencionalmente vacío para aislar la página de verificación
// de cualquier proveedor de contexto global que pueda causar conflictos.
export default function VerifyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
