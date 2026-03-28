import type { Priorytet } from './historyjka'
import type { User } from './user'

export type StanZadania = 'todo' | 'doing' | 'done'

export interface Zadanie {
  id: string
  nazwa: string
  opis: string
  priorytet: Priorytet
  historyjkaId: string
  przewidywanyCzas: number
  przepracowaneGodziny: number
  stan: StanZadania
  dataDodania: string
  dataStartu?: string
  dataZakonczenia?: string
  przypisanyUzytkownikId?: string
}

export type ZadanieCreateInput = Pick<Zadanie, 'nazwa' | 'opis' | 'priorytet' | 'historyjkaId' | 'przewidywanyCzas'>
