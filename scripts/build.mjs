/**
 * dsh-quick-view build: emit the node-half ESM (lib/index.js) and the browser
 * client bundle (lib/client.js).
 *
 * The browser half must be a standalone closure factory so the dsh web client
 * module system can load it and answer its externals from the module table.
 * The repo's shared tsdown preset does this in-tree; out-of-tree we replicate
 * the protocol with esbuild:
 *   - `format: 'cjs'` with `module`/`exports` locals declared in the banner, so
 *     the bundle body can write `module.exports` and the footer can return it;
 *   - externalize the platform baseline (react, cordis, runtime, ui-slots,
 *     ui-primitives, jsx-runtime) so those specifiers resolve through the
 *     module table's seed/row registry at runtime rather than re-bundled.
 *
 * The closure handoff is: window.__ModuleLoader__.load({ id, factory }).
 * `id` must equal the graph row id (the package name), and `factory` receives
 * the injected synchronous `require`. The banner is the single closure-opening
 * line plus the CommonJS locals; the footer closes the function and returns
 * `module.exports`.
 */

import { build } from 'esbuild'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const id = pkg.name

/** Platform baseline specifiers the shell seeds into the frozen module table. */
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
]

/** Dynamic specifiers whose factories the parser preloads before the shell. */
const PRELOADED_CLIENT_EXTERNALS = [
  '@deepseek-ai/dsh-client-runtime/client',
]

const clientExternals = [...PLATFORM_MODULES, ...PRELOADED_CLIENT_EXTERNALS]

// Node half: empty apply, ESM. No external deps; bundles to a plain module.
await build({
  entryPoints: [resolve(root, 'src/index.ts')],
  outfile: resolve(root, 'lib/index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  logLevel: 'info',
})

// Browser half: closure factory over the module-table require. The banner
// declares the closure-opening `load({id, factory: (require) => {` line plus
// the `module`/`exports` locals esbuild's cjs output references; the footer
// closes the factory and returns `module.exports`.
await build({
  entryPoints: [resolve(root, 'src/client/index.ts')],
  outfile: resolve(root, 'lib/client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  logLevel: 'info',
  // Automatic JSX runtime: emit react/jsx-runtime calls so the bundle needs
  // no global `React` and `react/jsx-runtime` stays a module-table external.
  jsx: 'automatic',
  external: clientExternals,
  banner: {
    js: [
      `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
      'var module = { exports: {} };',
      'var exports = module.exports;',
    ].join('\n'),
  },
  footer: {
    js: 'return module.exports; } });',
  },
})

console.log(`[dsh-quick-view] built ${id} -> lib/index.js, lib/client.js`)
