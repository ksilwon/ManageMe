export interface Project {
  id: string
  nazwa: string
  opis: string
}

export type ProjectCreateInput = Omit<Project, 'id'>
export type ProjectUpdateInput = Partial<Omit<Project, 'id'>>
