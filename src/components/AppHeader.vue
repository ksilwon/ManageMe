<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { currentUserService } from '../services/currentUserService'
import { useActiveProject } from '../composables/useActiveProject'
import { projectsApi } from '../api/projectsApi'
import type { Project } from '../types/project'

const { activeProjectId, setActiveProject, initActiveProject } = useActiveProject()

const emit = defineEmits<{
  (e: 'manage-projects'): void
}>()
const projects = ref<Project[]>([])
const showProjectsDropdown = ref(false)

onMounted(async () => {
  await initActiveProject()
  projects.value = await projectsApi.getAll()
})

const activeProject = computed(() => {
  if (!activeProjectId.value) return null
  return projects.value.find((p) => p.id === activeProjectId.value) ?? null
})

const userFullName = currentUserService.fullName

async function toggleDropdown() {
  if (!showProjectsDropdown.value) {
    projects.value = await projectsApi.getAll()
  }
  showProjectsDropdown.value = !showProjectsDropdown.value
}

function selectProject(id: string | null) {
  setActiveProject(id)
  showProjectsDropdown.value = false
}

const selectorRef = ref<HTMLElement | null>(null)
let closeHandler: ((e: MouseEvent) => void) | null = null
watch(showProjectsDropdown, async (open) => {
  if (closeHandler) {
    document.removeEventListener('click', closeHandler)
    closeHandler = null
  }
  if (!open) return
  await nextTick()
  closeHandler = (e: MouseEvent) => {
    if (selectorRef.value && !selectorRef.value.contains(e.target as Node)) {
      showProjectsDropdown.value = false
    }
  }
  setTimeout(() => document.addEventListener('click', closeHandler!), 0)
})
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <h1 class="logo">ManageMe</h1>
    </div>

    <div class="center">
      <div ref="selectorRef" class="project-selector">
        <button
          class="project-btn"
          :class="{ placeholder: !activeProject }"
          @click="toggleDropdown"
        >
          {{ activeProject?.nazwa ?? 'Wybierz projekt' }}
        </button>
        <div v-if="showProjectsDropdown" class="dropdown">
          <button
            v-if="activeProject"
            class="dropdown-item"
            @click="selectProject(null)"
          >
            — Brak projektu —
          </button>
          <button
            v-for="p in projects"
            :key="p.id"
            class="dropdown-item"
            :class="{ active: p.id === activeProjectId }"
            @click="selectProject(p.id)"
          >
            {{ p.nazwa }}
          </button>
          <p v-if="projects.length === 0" class="dropdown-empty">Brak projektów</p>
        </div>
      </div>
    </div>

    <div class="user">
      <button class="link-btn" @click="emit('manage-projects')">Projekty</button>
      <span class="user-name">{{ userFullName }}</span>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--code-bg);
}

.brand .logo {
  margin: 0;
  font-size: 20px;
}

.center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.project-selector {
  position: relative;
}

.project-btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  cursor: pointer;
  min-width: 200px;
}

.project-btn.placeholder {
  color: var(--text);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  min-width: 220px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 4px;
  z-index: 50;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-h);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item.active {
  background: var(--accent-bg);
}

.dropdown-empty {
  padding: 12px;
  margin: 0;
  color: var(--text);
  font-size: 14px;
}

.user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.link-btn {
  padding: 0;
  border: none;
  background: none;
  color: var(--text);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.link-btn:hover {
  color: var(--accent);
}

.user-name {
  font-size: 14px;
  color: var(--text-h);
}
</style>
