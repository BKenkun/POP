import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (fs.existsSync(standaloneDir)) {
  // Evita rutas duplicadas cuando el empaquetador de AI Studio comprime standalone-app.tar.gz
  // (.next/standalone -> /, .next/static -> /.next/static, public -> /public)
  const dupPublic = path.join(standaloneDir, 'public');
  const dupStatic = path.join(standaloneDir, '.next', 'static');

  if (fs.existsSync(dupPublic)) {
    fs.rmSync(dupPublic, { recursive: true, force: true });
    console.log('[clean-standalone] Removed duplicate .next/standalone/public');
  }

  if (fs.existsSync(dupStatic)) {
    fs.rmSync(dupStatic, { recursive: true, force: true });
    console.log('[clean-standalone] Removed duplicate .next/standalone/.next/static');
  }

  // Copia start-server.js dentro de .next/standalone para que esté disponible en la raíz (/) del contenedor
  const startScriptSrc = path.join(rootDir, 'start-server.js');
  const startScriptDest = path.join(standaloneDir, 'start-server.js');
  if (fs.existsSync(startScriptSrc)) {
    fs.copyFileSync(startScriptSrc, startScriptDest);
    console.log('[clean-standalone] Copied start-server.js into .next/standalone/');
  }
}
