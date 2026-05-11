import type { CSPModule } from './csp';
import createModule from '@bindings/connected-spaces-platform-bindings.js';

let cached: Promise<CSPModule> | undefined;

// Module instantiation is expensive (wasm compile + pthread pool init),
// so share one instance across tests in the same browser page.
export function loadCSP(): Promise<CSPModule> {
  cached ??= createModule();
  return cached;
}
