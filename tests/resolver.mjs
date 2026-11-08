/** Test-only alias resolver for LaneWatch's isolated safety tests. */
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const base = resolvePath(ROOT, 'src', specifier.slice(2));
    for (const candidate of [base, `${base}.ts`, `${base}/index.ts`]) {
      if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
    }
  }
  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
    if (!existsSync(base) && existsSync(`${base}.ts`)) {
      return { url: pathToFileURL(`${base}.ts`).href, shortCircuit: true };
    }
  }
  return next(specifier, context);
}
