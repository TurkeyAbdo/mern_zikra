import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const tasks = [
  ['--watch', 'server.js'],
  [fileURLToPath(import.meta.resolve('vite/package.json')).replace(/package\.json$/, 'bin/vite.js')]
];
const children = tasks.map((args, index) => spawn(process.execPath, args, {
  cwd: new URL(index ? '../client/' : '../server/', import.meta.url), stdio: 'inherit'
}));
let closing = false;
function stop(code) {
  if (closing) return;
  closing = true;
  children.forEach(child => child.kill());
  process.exitCode = code;
}
children.forEach(child => child.on('exit', code => stop(code ?? 0)));
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
