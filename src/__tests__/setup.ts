import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for jsdom (used by Radix UI)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
