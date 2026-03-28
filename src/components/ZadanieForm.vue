<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Zadanie, StanZadania } from '../types/zadanie'
import type { User } from '../types/user'
import { currentUserService } from '../services/currentUserService'

const props = defineProps<{
  modelValue: boolean
  historyjkaId?: string
  zadanie?: Zadanie | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: Partial<Zadanie>, isNew: boolean): void
}>()

const form = ref({
  nazwa: '',
  opis: '',
  priorytet: 'średni' as Zadanie['priorytet'],
  przewidywanyCzas: 1,
  przepracowaneGodziny: 0,
})

const assignableUsers = ref<User[]>([])
const selectedUserId = ref('')

onMounted(() => {
  assignableUsers.value = currentUserService.getUsersByRoles(['devops', 'developer'])
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.zadanie) {
        form.value = {
          nazwa: props.zadanie.nazwa,
          opis: props.zadanie.opis,
          priorytet: props.zadanie.priorytet,
          przewidywanyCzas: props.zadanie.przewidywanyCzas,
          przepracowaneGodziny: props.zadanie.przepracowaneGodziny || 0,
        }
        selectedUserId.value = props.zadanie.przypisanyUzytkownikId || ''
      } else {
        form.value = {
          nazwa: '',
          opis: '',
          priorytet: 'średni',
          przewidywanyCzas: 1,
          przepracowaneGodziny: 0,
        }
        selectedUserId.value = ''
      }
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  const isNew = !props.zadanie
  const baseData = {
    nazwa: form.value.nazwa,
    opis: form.value.opis,
    priorytet: form.value.priorytet,
    przewidywanyCzas: form.value.przewidywanyCzas,
    przepracowaneGodziny: form.value.przepracowaneGodziny,
    historyjkaId: props.historyjkaId || props.zadanie?.historyjkaId || '',
  }
  
  if (isNew) {
    emit('submit', baseData, true)
  } else {
    emit('submit', baseData, false)
  }
  close()
}

function assignUser() {
  if (!selectedUserId.value || !props.zadanie) return
  if (props.zadanie.stan === 'done') return
  
  const updates: Partial<Zadanie> = {
    przypisanyUzytkownikId: selectedUserId.value,
  }
  
  if (props.zadanie.stan === 'todo') {
    updates.stan = 'doing'
    updates.dataStartu = new Date().toISOString()
  }
  
  emit('submit', updates, false)
  close()
}

function markAsDone() {
  if (!props.zadanie) return
  if (props.zadanie.stan === 'done') return
  
  const updates: Partial<Zadanie> = {
    stan: 'done',
    dataZakonczenia: new Date().toISOString()
  }
  
  emit('submit', updates, false)
  close()
}

function formatDate(iso?: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('pl-PL')
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <header class="modal-header">
        <h3>{{ zadanie ? 'Szczegóły zadania' : 'Nowe zadanie' }}</h3>
        <button class="btn btn-icon" @click="close">✕</button>
      </header>
      
      <div class="modal-body">
        <form id="zadanieForm" @submit.prevent="submit" class="form">
          <div class="form-group">
            <label>Nazwa</label>
            <input v-model="form.nazwa" required class="input" />
          </div>
          <div class="form-group">
            <label>Opis</label>
            <textarea v-model="form.opis" class="input"></textarea>
          </div>
          <div class="form-group row">
            <div class="col">
              <label>Priorytet</label>
              <select v-model="form.priorytet" class="input">
                <option value="niski">Niski</option>
                <option value="średni">Średni</option>
                <option value="wysoki">Wysoki</option>
              </select>
            </div>
            <div class="col">
              <label>Czas (godz.)</label>
              <input type="number" min="0" v-model="form.przewidywanyCzas" required class="input" />
            </div>
          </div>
          
          <div class="form-group" v-if="zadanie">
            <label>Przepracowane godziny</label>
            <input type="number" min="0" v-model="form.przepracowaneGodziny" class="input" />
          </div>

          <div class="actions">
            <button type="button" class="btn btn-secondary" @click="close">Anuluj</button>
            <button type="submit" class="btn btn-primary">Zapisz</button>
          </div>
        </form>

        <hr class="divider" v-if="zadanie" />
        
        <div class="details-section" v-if="zadanie">
          <h4>Status i Przypisanie</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Stan:</span>
              <span class="value">{{ zadanie.stan }}</span>
            </div>
            <div class="info-item">
              <span class="label">Data startu:</span>
              <span class="value">{{ formatDate(zadanie.dataStartu) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Data zakończenia:</span>
              <span class="value">{{ formatDate(zadanie.dataZakonczenia) }}</span>
            </div>
          </div>

          <div class="assignment-box" v-if="zadanie.stan !== 'done'">
            <label>Przypisz osobę (zmienia status na doing)</label>
            <div class="assignment-row">
              <select v-model="selectedUserId" class="input">
                <option value="">-- Wybierz --</option>
                <option v-for="u in assignableUsers" :key="u.id" :value="u.id">
                  {{ u.imię }} {{ u.nazwisko }} ({{ u.rola }})
                </option>
              </select>
              <button class="btn btn-primary" @click="assignUser" :disabled="!selectedUserId || selectedUserId === zadanie.przypisanyUzytkownikId">Przypisz</button>
            </div>
          </div>

          <div class="done-box" v-if="zadanie.stan === 'doing'">
            <button class="btn btn-success full-width" @click="markAsDone">🟢 Zakończ zadanie (Done)</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal {
  background: var(--bg);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.modal-body {
  padding: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  flex-direction: row;
  gap: 12px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 14px;
  color: var(--text);
}

.input {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--code-bg);
  color: var(--text-h);
  font: inherit;
}

textarea.input {
  min-height: 80px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-success {
  background: #16a34a;
  color: white;
}

.btn-icon {
  background: transparent;
  color: var(--text);
  padding: 4px 8px;
}

.full-width {
  width: 100%;
}

.divider {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 24px 0;
}

.details-section h4 {
  margin: 0 0 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: var(--text);
}

.value {
  font-weight: 500;
}

.assignment-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.assignment-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.assignment-row .input {
  flex: 1;
}

.done-box {
  margin-top: 16px;
}
</style>
