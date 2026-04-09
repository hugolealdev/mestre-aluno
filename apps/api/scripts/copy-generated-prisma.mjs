import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = resolve(__dirname, '../src/generated/prisma');
const targetDir = resolve(__dirname, '../dist/generated/prisma');

if (!existsSync(sourceDir)) {
  console.error(`Prisma generated client not found at ${sourceDir}`);
  process.exit(1);
}

mkdirSync(resolve(__dirname, '../dist/generated'), { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true, force: true });
