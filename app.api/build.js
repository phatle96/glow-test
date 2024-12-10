import { dotenvRun } from '@dotenv-run/esbuild';
import { build } from 'esbuild';

await build({
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  write: true,
  entryPoints: [`./src/index.ts`],
  external: ['sharp'],
  inject: ['./cjs-shim.ts'],
  sourcemap: true,
  plugins: [
    dotenvRun({
      verbose: true,
      root: '../',
    }),
  ],
});