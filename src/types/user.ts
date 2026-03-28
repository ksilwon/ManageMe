export type Role = 'admin' | 'devops' | 'developer'

export interface User {
  id: string
  imię: string
  nazwisko: string
  rola: Role
}
