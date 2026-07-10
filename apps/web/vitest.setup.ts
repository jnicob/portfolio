import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// RTL's own auto-cleanup only registers when it detects a global `afterEach`
// (Jest-style globals). This project runs Vitest without `test.globals: true`
// (explicit imports everywhere), so we wire cleanup manually or the DOM leaks
// between tests within the same file.
afterEach(() => {
  cleanup();
});
