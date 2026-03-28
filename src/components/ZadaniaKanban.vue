<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Zadanie } from '../types/zadanie'
import type { Historyjka } from '../types/historyjka'
import { zadaniaApi } from '../api/zadaniaApi'
import { historyjkiApi } from '../api/historyjkiApi'
import { currentUserService } from '../services/currentUserService'
import ZadanieForm from './ZadanieForm.vue'
import type { User } from '../types/user'

const props = defineProps<{
  historyjka: Historyjka
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'historyjka-updated'): void
}>()

const zadania = ref<Zadanie[]>([])
const loading = ref(true)

const showForm = ref(false)
const editingZadanie = ref<Zadanie | null>(null)

const todo = computed(() => zadania.value.filter(z => z.stan === 'todo'))
const doing = computed(() => zadania.value.filter(z => z.stan === 'doing'))
const done = computed(() => zadania.value.filter(z => z.stan === 'done'))

const assignableUsers = ref<User[]>([])

onMounted(() => {
  assignableUsers.value = currentUserService.getUsersByRoles(['devops', 'developer'])
  loadZadania()
})

watch(() => props.historyjka.id, loadZadania)

async function loadZadania() {
  loading.value = true
  try {
    zadania.value = await zadaniaApi.getByHistoryjka(props.historyjka.id)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingZadanie.value = null
  showForm.value = true
}

function openEdit(z: Zadanie) {
  editingZadanie.value = z
  showForm.value = true
}

async function checkAndUpdateHistoryjkaState() {
  const currentHistoryjka = await historyjkiApi.getById(props.historyjka.id)
  if (!currentHistoryjka) return

  const allZadania = await zadaniaApi.getByHistoryjka(props.historyjka.id)
  if (allZadania.length === 0) return

  const hasDoingOrDone = allZadania.some(z => z.stan === 'doing' || z.stan === 'done')
  const allDone = allZadania.every(z => z.stan === 'done')

  let newState = currentHistoryjka.stan

  if (allDone) {
    newState = 'done'
  } else if (hasDoingOrDone && currentHistoryjka.stan === 'todo') {
    newState = 'doing'
  }

  if (newState !== currentHistoryjka.stan) {
    await historyjkiApi.update(currentHistoryjka.id, { stan: newState })
    emit('historyjka-updated')
  }
}

async function handleSubmit(data: Partial<Zadanie>, isNew: boolean) {
  try {
    if (isNew) {
      await zadaniaApi.create(data as import('../types/zadanie').ZadanieCreateInput)
    } else if (editingZadanie.value) {
      await zadaniaApi.update(editingZadanie.value.id, data)
    }
    await loadZadania()
    await checkAndUpdateHistoryjkaState()
  } catch (e) {
    console.error('Błąd zapisu zadania', e)
  }
}

async function remove(z: Zadanie) {
  if (!confirm(`Usunąć zadanie „${z.nazwa}"?`)) return
  const ok = await zadaniaApi.delete(z.id)
  if (ok) {
    zadania.value = zadania.value.filter((x) => x.id !== z.id)
    await checkAndUpdateHistoryjkaState()
  }
}

function getUserName(userId?: string) {
  if (!userId) return 'Brak przypisania'
  const u = assignableUsers.value.find(user => user.id === userId)
  if (!u) return 'Nieznany użytkownik'
  return `${u.imię} ${u.nazwisko} (${u.rola})`
}
</script>

<template>
  <div class="kanban-view">
    <header class="kanban-header">
      <div class="header-left">
        <button class="btn btn-back" @click="$emit('close')">← Wróć do historyjek</button>
        <h2>Zadania: {{ historyjka.nazwa }}</h2>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nowe zadanie</button>
    </header>

    <div v-if="loading" class="loading">Ładowanie…</div>
    
    <div v-else class="kanban-board">
      <div class="kanban-col">
        <div class="col-header">
          <h3>Do zrobienia ({{ todo.length }})</h3>
        </div>
        <div class="col-body">
          <div v-for="z in todo" :key="z.id" class="task-card" @click="openEdit(z)">
            <div class="task-priority" :class="'priorytet-' + z.priorytet"></div>
            <h4>{{ z.nazwa }}</h4>
            <div class="task-meta">
              <span>Czas: {{ z.przewidywanyCzas }}h</span>
            </div>
            <div class="task-assignee">
              👤 {{ getUserName(z.przypisanyUzytkownikId) }}
            </div>
          </div>
          <div v-if="todo.length === 0" class="empty-col">Brak zadań</div>
        </div>
      </div>

      <div class="kanban-col">
        <div class="col-header">
          <h3>W trakcie ({{ doing.length }})</h3>
        </div>
        <div class="col-body">
          <div v-for="z in doing" :key="z.id" class="task-card" @click="openEdit(z)">
            <div class="task-priority" :class="'priorytet-' + z.priorytet"></div>
            <h4>{{ z.nazwa }}</h4>
            <div class="task-meta">
              <span>Czas: {{ z.przewidywanyCzas }}h</span>
            </div>
            <div class="task-assignee">
              👤 {{ getUserName(z.przypisanyUzytkownikId) }}
            </div>
          </div>
          <div v-if="doing.length === 0" class="empty-col">Brak zadań</div>
        </div>
      </div>

      <div class="kanban-col">
        <div class="col-header">
          <h3>Zamknięte ({{ done.length }})</h3>
        </div>
        <div class="col-body">
          <div v-for="z in done" :key="z.id" class="task-card" @click="openEdit(z)">
            <div class="task-priority" :class="'priorytet-' + z.priorytet"></div>
            <h4>{{ z.nazwa }}</h4>
            <div class="task-meta">
              <span>Czas: {{ z.przewidywanyCzas }}h</span>
            </div>
            <div class="task-assignee">
              👤 {{ getUserName(z.przypisanyUzytkownikId) }}
            </div>
          </div>
          <div v-if="done.length === 0" class="empty-col">Brak zadań</div>
        </div>
      </div>
    </div>

    <ZadanieForm 
      v-model="showForm" 
      :historyjka-id="historyjka.id"
      :zadanie="editingZadanie" 
      @submit="handleSubmit" 
    />
  </div>
</template>

<style scoped>
.kanban-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
}

.kanban-board {
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow-x: auto;
  align-items: flex-start;
}

.kanban-col {
  flex: 1;
  min-width: 300px;
  background: var(--code-bg);
  border-radius: 12px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}

.col-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.col-header h3 {
  margin: 0;
  font-size: 16px;
}

.col-body {
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--accent);
}

.task-priority {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  border-radius: 8px 0 0 8px;
}

.priorytet-niski { background: #16a34a; }
.priorytet-średni { background: #ca8a04; }
.priorytet-wysoki { background: #dc2626; }

.task-card h4 {
  margin: 0 0 8px 12px;
  font-size: 15px;
}

.task-meta {
  margin-left: 12px;
  font-size: 12px;
  color: var(--text);
  margin-bottom: 8px;
}

.task-assignee {
  margin-left: 12px;
  font-size: 12px;
  color: var(--text-h);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.empty-col {
  text-align: center;
  padding: 24px;
  color: var(--text);
  font-size: 14px;
}

.btn-back {
  background: transparent;
  color: var(--text);
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.btn-back:hover {
  background: var(--code-bg);
}

.btn-primary {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
</style>
