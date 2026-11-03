export {}

declare global {
  interface Window {
    invokeNative?: unknown
    GetParentResourceName?: () => string
    __nui?: Array<{ event: string; data: unknown }>
  }
}
