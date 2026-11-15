const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

/**
 * Comprueba si un puerto local ya está ocupado (por ejemplo, Nginx en 8080 en el contenedor de AI Studio).
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', (err) => {
        resolve(err.code === 'EADDRINUSE');
      })
      .once('listening', () => {
        tester.close(() => resolve(false));
      });
    tester.listen(port, '0.0.0.0');
  });
}

async function resolvePort() {
  // 1. En el contenedor desplegado de AI Studio, Nginx escucha en PORT=8080 y redirige a DEFAULT_APP_PORT (3000).
  if (process.env.DEFAULT_APP_PORT) {
    return String(process.env.DEFAULT_APP_PORT);
  }

  const envPort = process.env.PORT;
  if (envPort) {
    const busy = await isPortInUse(Number(envPort));
    if (busy && String(envPort) !== '3000') {
      console.log(
        `[start-server] Port ${envPort} is already occupied (reverse proxy detected); binding app to 3000.`
      );
      return '3000';
    }
    return String(envPort);
  }

  return '3000';
}

async function main() {
  const targetPort = await resolvePort();
  process.env.PORT = targetPort;
  process.env.HOSTNAME = '0.0.0.0';

  const rootServer = path.join(process.cwd(), 'server.js');
  const standaloneServer = path.join(process.cwd(), '.next', 'standalone', 'server.js');

  // Escenario 1: Contenedor standalone extraído en la raíz (./server.js)
  if (fs.existsSync(rootServer)) {
    console.log(`[start-server] Starting ./server.js on 0.0.0.0:${targetPort}`);
    require(rootServer);
    return;
  }

  // Escenario 2: Ejecución local / contenedor con .next/standalone/server.js
  if (fs.existsSync(standaloneServer)) {
    // Si se ejecuta fuera del tar virtual de AI Studio, enlaza public y .next/static si faltan
    const standaloneDir = path.dirname(standaloneServer);
    const pubSrc = path.join(process.cwd(), 'public');
    const pubDst = path.join(standaloneDir, 'public');
    const staticSrc = path.join(process.cwd(), '.next', 'static');
    const staticDst = path.join(standaloneDir, '.next', 'static');

    try {
      if (fs.existsSync(pubSrc) && !fs.existsSync(pubDst)) {
        fs.symlinkSync(pubSrc, pubDst, 'dir');
      }
      if (fs.existsSync(staticSrc) && !fs.existsSync(staticDst)) {
        fs.mkdirSync(path.dirname(staticDst), { recursive: true });
        fs.symlinkSync(staticSrc, staticDst, 'dir');
      }
    } catch {
      // Ignorar si el sistema de archivos es de solo lectura
    }

    console.log(`[start-server] Starting .next/standalone/server.js on 0.0.0.0:${targetPort}`);
    require(standaloneServer);
    return;
  }

  // Escenario 3: Fallback a next start
  console.log(`[start-server] Starting next start on 0.0.0.0:${targetPort}`);
  const child = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', targetPort], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error('[start-server] Fatal startup error:', err);
  process.exit(1);
});
