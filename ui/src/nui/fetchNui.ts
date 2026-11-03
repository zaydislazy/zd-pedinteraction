import { isEnvBrowser, resourceName } from './environment'

export async function fetchNui<T = unknown>(event: string, data?: unknown): Promise<T | null> {
  if (isEnvBrowser()) {
    window.__nui = window.__nui ?? []
    window.__nui.push({ event, data })
    return null
  }

  try {
    const response = await fetch(`https://${resourceName()}/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data ?? {}),
    })
    return (await response.json()) as T
  } catch {
    return null
  }
}
