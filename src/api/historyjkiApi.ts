import type { Historyjka, HistoryjkaCreateInput } from '../types/historyjka'
import { HISTORYJKI_STORAGE_KEY } from './storageKey'

/**
 * API do zarządzania historyjkami (funkcjonalnościami) projektu.
 * Używa localStorage – w przyszłości można podmienić na backend.
 */
class HistoryjkiApi {
  private storageKey = HISTORYJKI_STORAGE_KEY

  private getHistoryjki(): Historyjka[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Historyjka[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private setHistoryjki(items: Historyjka[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items))
  }

  private generateId(): string {
    return crypto.randomUUID()
  }

  async getByProject(projectId: string): Promise<Historyjka[]> {
    const all = this.getHistoryjki()
    return Promise.resolve(all.filter((h) => h.projekt === projectId))
  }

  async getById(id: string): Promise<Historyjka | null> {
    const all = this.getHistoryjki()
    return Promise.resolve(all.find((h) => h.id === id) ?? null)
  }

  async create(input: HistoryjkaCreateInput): Promise<Historyjka> {
    const historyjka: Historyjka = {
      ...input,
      id: this.generateId(),
      dataUtworzenia: new Date().toISOString(),
    }
    const all = this.getHistoryjki()
    all.push(historyjka)
    this.setHistoryjki(all)
    return Promise.resolve(historyjka)
  }

  async update(
    id: string,
    updates: Partial<Omit<Historyjka, 'id' | 'dataUtworzenia'>>
  ): Promise<Historyjka | null> {
    const all = this.getHistoryjki()
    const index = all.findIndex((h) => h.id === id)
    if (index === -1) return Promise.resolve(null)

    all[index] = { ...all[index], ...updates }
    this.setHistoryjki(all)
    return Promise.resolve(all[index])
  }

  async delete(id: string): Promise<boolean> {
    const all = this.getHistoryjki()
    const filtered = all.filter((h) => h.id !== id)
    if (filtered.length === all.length) return Promise.resolve(false)
    this.setHistoryjki(filtered)
    return Promise.resolve(true)
  }
}

export const historyjkiApi = new HistoryjkiApi()
