import '@testing-library/jest-dom'
import { setupBrowserPolyfills } from '@/utils/polyfills'

// Setup browser polyfills for tests
setupBrowserPolyfills()

// Mock IntersectionObserver
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: class IntersectionObserver {
    root = null
    rootMargin = ''
    thresholds = []
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() { return [] }
  },
})

// Mock ResizeObserver
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  },
})