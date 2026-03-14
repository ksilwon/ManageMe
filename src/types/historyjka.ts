export type Priorytet = 'niski' | 'średni' | 'wysoki'

export type StanHistoryjki = 'todo' | 'doing' | 'done'

export interface Historyjka {
  id: string
  nazwa: string
  opis: string
  priorytet: Priorytet
  projekt: string
  dataUtworzenia: string
  stan: StanHistoryjki
  właściciel: string
}

export type HistoryjkaCreateInput = Omit<Historyjka, 'id' | 'dataUtworzenia'>
