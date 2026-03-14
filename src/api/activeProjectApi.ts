import { ACTIVE_PROJECT_STORAGE_KEY } from './storageKey'

/**
 * API do zapamiętywania aktywnego projektu.
 * Używa localStorage – w przyszłości można podmienić na backend.
 */
class ActiveProjectApi {
  private storageKey = ACTIVE_PROJECT_STORAGE_KEY

  async get(): Promise<string | null> {
    return Promise.resolve(localStorage.getItem(this.storageKey))
  }

  async set(projectId: string | null): Promise<void> {
    if (projectId === null) {
      localStorage.removeItem(this.storageKey)
    } else {
      localStorage.setItem(this.storageKey, projectId)
    }
    return Promise.resolve()
  }
}

export const activeProjectApi = new ActiveProjectApi()
