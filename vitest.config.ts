import { defineConfig } from 'vitest/config';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const BUILD_DIRS: Record<string, string> = {
  debug: 'build/Debug',
  release: 'build/Release',
};

export default defineConfig(({ mode }) => {
  const relative = BUILD_DIRS[mode];
  if (!relative) {
    throw new Error(
      `vitest --mode must be one of: ${Object.keys(BUILD_DIRS).join(', ')} (got "${mode}")`,
    );
  }

  const buildDir = resolve(process.cwd(), relative);
  if (!existsSync(buildDir)) {
    throw new Error(
      `Build directory not found: ${buildDir}. Build the bindings first (cmake --build --preset ${mode}).`,
    );
  }

  return {
    test: {
      globals: true,
      include: ['tests/**/*.test.ts'],
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        instances: [{ browser: 'chromium' }],
      },
    },
    server: {
      // Emscripten's ES6 loader resolves its sibling .wasm via import.meta.url,
      // so the dev server needs filesystem access to the CMake build directory.
      fs: { allow: [process.cwd(), buildDir] },
      // SharedArrayBuffer (required by -pthread) needs cross-origin isolation.
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    resolve: {
      alias: {
        '@bindings': buildDir,
      },
    },
  };
});
