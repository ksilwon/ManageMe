import type { User, Role } from '../types/user'

const MOCK_USER: User = {
  id: 'mock-user-1',
  imię: 'Jan',
  nazwisko: 'Kowalski',
  rola: 'admin'
}

export const mockUsers: User[] = [
  MOCK_USER,
  {
    id: 'mock-user-2',
    imię: 'Anna',
    nazwisko: 'Nowak',
    rola: 'developer'
  },
  {
    id: 'mock-user-3',
    imię: 'Marek',
    nazwisko: 'Zieliński',
    rola: 'devops'
  }
]

class CurrentUserService {
  private _user: User = MOCK_USER

  get user(): User {
    return this._user
  }

  get fullName(): string {
    return `${this._user.imię} ${this._user.nazwisko}`.trim()
  }

  getUsersByRoles(roles: Role[]): User[] {
    return mockUsers.filter(u => roles.indexOf(u.rola) !== -1)
  }
}

export const currentUserService = new CurrentUserService()
