/**
 * localStorage 封装
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  },
}
