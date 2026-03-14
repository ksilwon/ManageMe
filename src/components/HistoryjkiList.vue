<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Historyjka, StanHistoryjki } from '../types/historyjka'
import { historyjkiApi } from '../api/historyjkiApi'
import { currentUserService } from '../services/currentUserService'
import HistoryjkaForm from './HistoryjkaForm.vue'

const props = defineProps<{
  projectId: string
}>()

const historyjki = ref<Historyjka[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingHistoryjka = ref<Historyjka | null>(null)
const filterStan = ref<StanHistoryjki | 'all'>('all')

const STANY: { value: StanHistoryjki | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'todo', label: 'Do zrobienia' },
  { value: 'doing', label: 'W trakcie' },
  { value: 'done', label: 'Zamknięte' },
]

const filteredHistoryjki = computed(() => {
  const list = historyjki.value
  if (filterStan.value === 'all') return list
  return list.filter((h) => h.stan === filterStan.value)
})

const todo = computed(() => historyjki.value.filter((h) => h.stan === 'todo'))
const doing = computed(() => historyjki.value.filter((h) => h.stan === 'doing'))
const done = computed(() => historyjki.value.filter((h) => h.stan === 'done'))

watch(
  () => props.projectId,
  () => loadHistoryjki(),
  { immediate: true }
)

onMounted(loadHistoryjki)

async function loadHistoryjki() {
  if (!props.projectId) {
    historyjki.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    historyjki.value = await historyjkiApi.getByProject(props.projectId)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingHistoryjka.value = null
  showForm.value = true
}

function openEdit(h: Historyjka) {
  editingHistoryjka.value = h
  showForm.value = true
}

async function handleSubmit(data: {
  nazwa: string
  opis: string
  priorytet: Historyjka['priorytet']
  stan: StanHistoryjki
}) {
  try {
    if (editingHistoryjka.value) {
      const updated = await historyjkiApi.update(editingHistoryjka.value.id, data)
      if (updated) {
        const i = historyjki.value.findIndex((h) => h.id === updated.id)
        if (i !== -1) historyjki.value[i] = updated
      }
    } else {
      const created = await historyjkiApi.create({
        ...data,
        projekt: props.projectId,
        właściciel: currentUserService.user.id,
      })
      historyjki.value.push(created)
    }
  } catch (e) {
    console.error('Błąd zapisu:', e)
  }
}

async function remove(h: Historyjka) {
  if (!confirm(`Usunąć historyjkę „${h.nazwa}"?`)) return
  const ok = await historyjkiApi.delete(h.id)
  if (ok) {
    historyjki.value = historyjki.value.filter((x) => x.id !== h.id)
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function priorytetLabel(p: string) {
  const map: Record<string, string> = {
    niski: 'Niski',
    średni: 'Średni',
    wysoki: 'Wysoki',
  }
  return map[p] ?? p
}
</script>

<template>
  <div class="historyjki-list">
    <header class="header">
      <h2>Historyjki</h2>
      <div class="toolbar">
        <select v-model="filterStan" class="filter-select">
          <option v-for="s in STANY" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
        <button class="btn btn-primary" @click="openCreate">+ Nowa historyjka</button>
      </div>
    </header>

    <div v-if="loading" class="loading">Ładowanie…</div>

    <div v-else-if="!projectId" class="empty">
      Wybierz projekt w nagłówku, aby zarządzać historyjkami.
    </div>

    <div v-else-if="filteredHistoryjki.length === 0" class="empty">
      Brak historyjek. Kliknij „Nowa historyjka”, aby dodać pierwszą.
    </div>

    <div v-else class="sections">
      <template v-if="filterStan === 'all'">
        <section v-if="todo.length" class="section">
          <h3 class="section-title">Do zrobienia</h3>
          <ul class="cards">
            <li v-for="h in todo" :key="h.id" class="card">
              <div class="card-body">
                <div class="card-meta">
                  <span class="badge" :class="'priorytet-' + h.priorytet">{{ priorytetLabel(h.priorytet) }}</span>
                  <span class="date">{{ formatDate(h.dataUtworzenia) }}</span>
                </div>
                <h4 class="card-title">{{ h.nazwa }}</h4>
                <p v-if="h.opis" class="card-desc">{{ h.opis }}</p>
              </div>
              <div class="card-actions">
                <button class="btn btn-icon" title="Edytuj" @click="openEdit(h)">✎</button>
                <button class="btn btn-icon btn-danger" title="Usuń" @click="remove(h)">✕</button>
              </div>
            </li>
          </ul>
        </section>
        <section v-if="doing.length" class="section">
          <h3 class="section-title">W trakcie</h3>
          <ul class="cards">
            <li v-for="h in doing" :key="h.id" class="card">
              <div class="card-body">
                <div class="card-meta">
                  <span class="badge" :class="'priorytet-' + h.priorytet">{{ priorytetLabel(h.priorytet) }}</span>
                  <span class="date">{{ formatDate(h.dataUtworzenia) }}</span>
                </div>
                <h4 class="card-title">{{ h.nazwa }}</h4>
                <p v-if="h.opis" class="card-desc">{{ h.opis }}</p>
              </div>
              <div class="card-actions">
                <button class="btn btn-icon" title="Edytuj" @click="openEdit(h)">✎</button>
                <button class="btn btn-icon btn-danger" title="Usuń" @click="remove(h)">✕</button>
              </div>
            </li>
          </ul>
        </section>
        <section v-if="done.length" class="section">
          <h3 class="section-title">Zamknięte</h3>
          <ul class="cards">
            <li v-for="h in done" :key="h.id" class="card">
              <div class="card-body">
                <div class="card-meta">
                  <span class="badge" :class="'priorytet-' + h.priorytet">{{ priorytetLabel(h.priorytet) }}</span>
                  <span class="date">{{ formatDate(h.dataUtworzenia) }}</span>
                </div>
                <h4 class="card-title">{{ h.nazwa }}</h4>
                <p v-if="h.opis" class="card-desc">{{ h.opis }}</p>
              </div>
              <div class="card-actions">
                <button class="btn btn-icon" title="Edytuj" @click="openEdit(h)">✎</button>
                <button class="btn btn-icon btn-danger" title="Usuń" @click="remove(h)">✕</button>
              </div>
            </li>
          </ul>
        </section>
      </template>
      <section v-else class="section">
        <ul class="cards">
          <li v-for="h in filteredHistoryjki" :key="h.id" class="card">
            <div class="card-body">
              <div class="card-meta">
                <span class="badge" :class="'priorytet-' + h.priorytet">{{ priorytetLabel(h.priorytet) }}</span>
                <span class="date">{{ formatDate(h.dataUtworzenia) }}</span>
              </div>
              <h4 class="card-title">{{ h.nazwa }}</h4>
              <p v-if="h.opis" class="card-desc">{{ h.opis }}</p>
            </div>
            <div class="card-actions">
              <button class="btn btn-icon" title="Edytuj" @click="openEdit(h)">✎</button>
              <button class="btn btn-icon btn-danger" title="Usuń" @click="remove(h)">✕</button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <HistoryjkaForm
      v-model="showForm"
      :historyjka="editingHistoryjka"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.historyjki-list {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 22px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
  background: var(--code-bg);
  color: var(--text-h);
}

.loading,
.empty {
  color: var(--text);
  padding: 40px;
  text-align: center;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 16px;
  color: var(--text);
}

.cards {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--code-bg);
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.priorytet-niski {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.priorytet-średni {
  background: rgba(234, 179, 8, 0.2);
  color: #ca8a04;
}

.priorytet-wysoki {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.date {
  font-size: 12px;
  color: var(--text);
}

.card-title {
  margin: 0 0 6px;
  font-size: 16px;
}

.card-desc {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  white-space: pre-wrap;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.btn {
  padding: 8px 16px;
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
  padding: 6px 10px;
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
