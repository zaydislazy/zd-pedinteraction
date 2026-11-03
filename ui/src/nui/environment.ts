export function isEnvBrowser(): boolean {
  return typeof window.invokeNative !== 'function'
}

export function resourceName(): string {
  return window.GetParentResourceName?.() ?? 'zd-pedinteraction'
}
