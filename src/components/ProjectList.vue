<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Project } from '../types/project'
import { projectsApi } from '../api/projectsApi'
import ProjectForm from './ProjectForm.vue'

const projects = ref<Project[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingProject = ref<Project | null>(null)

onMounted(loadProjects)

async function loadProjects() {
  loading.value = true
  try {
    projects.value = await projectsApi.getAll()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingProject.value = null
  showForm.value = true
}

function openEdit(project: Project) {
  editingProject.value = project
  showForm.value = true
}

async function handleSubmit(data: { nazwa: string; opis: string }) {
  try {
    if (editingProject.value) {
      const updated = await projectsApi.update(editingProject.value.id, data)
      if (updated) {
        const i = projects.value.findIndex((p) => p.id === updated.id)
        if (i !== -1) projects.value[i] = updated
      }
    } else {
      const created = await projectsApi.create(data)
      projects.value.push(created)
    }
  } catch (e) {
    console.error('Błąd zapisu:', e)
  }
}

async function remove(project: Project) {
  if (!confirm(`Czy na pewno usunąć projekt „${project.nazwa}"?`)) return
  const ok = await projectsApi.delete(project.id)
  if (ok) {
    projects.value = projects.value.filter((p) => p.id !== project.id)
  }
}
</script>

<template>
  <div class="project-list">
    <header class="header">
      <h1>ManageMe</h1>
      <p class="subtitle">Zarządzanie projektami</p>
      <button class="btn btn-primary" @click="openCreate">+ Nowy projekt</button>
    </header>

    <div v-if="loading" class="loading">Ładowanie…</div>

    <div v-else-if="projects.length === 0" class="empty">
      Brak projektów. Kliknij „Nowy projekt”, aby dodać pierwszy.
    </div>

    <ul v-else class="cards">
      <li v-for="p in projects" :key="p.id" class="card">
        <div class="card-body">
          <h3 class="card-title">{{ p.nazwa }}</h3>
          <p v-if="p.opis" class="card-desc">{{ p.opis }}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-icon" title="Edytuj" @click="openEdit(p)">✎</button>
          <button class="btn btn-icon btn-danger" title="Usuń" @click="remove(p)">✕</button>
        </div>
      </li>
    </ul>

    <ProjectForm
      v-model="showForm"
      :project="editingProject"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.project-list {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  color: var(--text);
  margin: 0 0 20px;
}

.loading,
.empty {
  color: var(--text);
  padding: 40px;
  text-align: center;
}

.cards {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--code-bg);
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0 0 8px;
  font-size: 18px;
}

.card-desc {
  margin: 0;
  font-size: 15px;
  color: var(--text);
  white-space: pre-wrap;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-icon {
  padding: 8px 12px;
  background: transparent;
  color: var(--text);
}

.btn-icon:hover {
  background: var(--accent-bg);
  color: var(--accent);
}

.btn-danger:hover {
  background: rgba(220, 38, 38, 0.15);
  color: #dc2626;
}
</style>
