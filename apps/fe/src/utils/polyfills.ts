import { Buffer } from 'buffer'

export function setupBrowserPolyfills(): void {
  if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
    (window as any).global = window;
  }
}