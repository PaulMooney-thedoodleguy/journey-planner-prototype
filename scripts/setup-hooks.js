import { copyFileSync, chmodSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const hooksDir = join(root, '.git', 'hooks');
const src = join(__dirname, 'pre-commit');
const dest = join(hooksDir, 'pre-commit');

if (!existsSync(join(root, '.git'))) {
  console.error('Not a git repository. Run `git init` first.');
  process.exit(1);
}

if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });

copyFileSync(src, dest);
try { chmodSync(dest, 0o755); } catch { /* Windows — chmod is a no-op */ }

console.log('✓ Pre-commit hook installed. Secrets will be blocked before every commit.');
