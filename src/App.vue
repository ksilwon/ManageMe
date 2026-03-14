<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ProjectList from './components/ProjectList.vue'
import HistoryjkiList from './components/HistoryjkiList.vue'
import { useActiveProject } from './composables/useActiveProject'

const { activeProjectId, initActiveProject } = useActiveProject()
const showProjectsManager = ref(false)

initActiveProject()

const showEmptyState = computed(
  () => !showProjectsManager.value && !activeProjectId.value
)
</script>

<template>
  <div class="app">
    <AppHeader @manage-projects="showProjectsManager = true" />
    <main class="main">
      <div v-if="showProjectsManager" class="view">
        <div class="view-header">
          <button class="btn btn-back" @click="showProjectsManager = false">
            ← Powrót
          </button>
        </div>
        <ProjectList />
      </div>
      <div v-else-if="showEmptyState" class="empty-state">
        <p>Wybierz projekt w nagłówku lub dodaj nowy.</p>
        <button class="btn btn-primary" @click="showProjectsManager = true">
          Zarządzaj projektami
        </button>
      </div>
      <div v-else class="view">
        <HistoryjkiList v-if="activeProjectId" :project-id="activeProjectId" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
}

.view {
  padding-bottom: 32px;
}

.view-header {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 24px 0;
}

.btn-back {
  padding: 8px 0;
  border: none;
  background: none;
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.btn-back:hover {
  color: var(--accent);
}

.empty-state {
  max-width: 400px;
  margin: 48px auto;
  padding: 24px;
  text-align: center;
}

.empty-state p {
  margin: 0 0 16px;
  color: var(--text);
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
</style>
