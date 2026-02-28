import type { Project, ProjectCreateInput } from '../types/project'
import { PROJECTS_STORAGE_KEY } from './storageKey'

/**
 * API do zarządzania projektami.
 * Obecnie używa localStorage – w przyszłości można podmienić na NoSQL w chmurze.
 */
class ProjectsApi {
  private storageKey = PROJECTS_STORAGE_KEY

  private getProjects(): Project[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Project[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private setProjects(projects: Project[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(projects))
  }

  private generateId(): string {
    return crypto.randomUUID()
  }

  async getAll(): Promise<Project[]> {
    return Promise.resolve(this.getProjects())
  }

  async getById(id: string): Promise<Project | null> {
    const projects = this.getProjects()
    return Promise.resolve(projects.find((p) => p.id === id) ?? null)
  }

  async create(input: ProjectCreateInput): Promise<Project> {
    const project: Project = {
      ...input,
      id: this.generateId(),
    }
    const projects = this.getProjects()
    projects.push(project)
    this.setProjects(projects)
    return Promise.resolve(project)
  }

  async update(id: string, updates: Partial<Omit<Project, 'id'>>): Promise<Project | null> {
    const projects = this.getProjects()
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) return Promise.resolve(null)

    projects[index] = { ...projects[index], ...updates }
    this.setProjects(projects)
    return Promise.resolve(projects[index])
  }

  async delete(id: string): Promise<boolean> {
    const projects = this.getProjects()
    const filtered = projects.filter((p) => p.id !== id)
    if (filtered.length === projects.length) return Promise.resolve(false)
    this.setProjects(filtered)
    return Promise.resolve(true)
  }
}

export const projectsApi = new ProjectsApi()
