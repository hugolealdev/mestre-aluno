import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: new URL('..', import.meta.url),
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('pnpm', ['prisma:migrate']);
run('node', ['dist/main.js']);
