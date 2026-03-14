<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Historyjka, Priorytet, StanHistoryjki } from '../types/historyjka'

const PRIORYTETY: { value: Priorytet; label: string }[] = [
  { value: 'niski', label: 'Niski' },
  { value: 'średni', label: 'Średni' },
  { value: 'wysoki', label: 'Wysoki' },
]

const STANY: { value: StanHistoryjki; label: string }[] = [
  { value: 'todo', label: 'Do zrobienia' },
  { value: 'doing', label: 'W trakcie' },
  { value: 'done', label: 'Zamknięte' },
]

const props = defineProps<{
  modelValue: boolean
  historyjka?: Historyjka | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { nazwa: string; opis: string; priorytet: Priorytet; stan: StanHistoryjki }): void
}>()

const nazwa = ref('')
const opis = ref('')
const priorytet = ref<Priorytet>('średni')
const stan = ref<StanHistoryjki>('todo')
const dialogRef = ref<HTMLDialogElement | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.historyjka) {
        nazwa.value = props.historyjka.nazwa
        opis.value = props.historyjka.opis
        priorytet.value = props.historyjka.priorytet
        stan.value = props.historyjka.stan
      } else {
        nazwa.value = ''
        opis.value = ''
        priorytet.value = 'średni'
        stan.value = 'todo'
      }
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
  { immediate: true }
)

const isEditing = () => !!props.historyjka

function handleSubmit() {
  if (!nazwa.value.trim()) return
  emit('submit', {
    nazwa: nazwa.value.trim(),
    opis: opis.value.trim(),
    priorytet: priorytet.value,
    stan: stan.value,
  })
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <dialog ref="dialogRef" class="modal" @cancel="close" @close="emit('update:modelValue', false)">
    <div class="modal-content">
      <h2>{{ isEditing() ? 'Edytuj historyjkę' : 'Nowa historyjka' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="h-nazwa">Nazwa</label>
          <input
            id="h-nazwa"
            v-model="nazwa"
            type="text"
            required
            placeholder="Nazwa historyjki"
            autocomplete="off"
          />
        </div>
        <div class="field">
          <label for="h-opis">Opis</label>
          <textarea id="h-opis" v-model="opis" rows="4" placeholder="Opis" />
        </div>
        <div class="field">
          <label for="h-priorytet">Priorytet</label>
          <select id="h-priorytet" v-model="priorytet">
            <option v-for="p in PRIORYTETY" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="h-stan">Stan</label>
          <select id="h-stan" v-model="stan">
            <option v-for="s in STANY" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-secondary" @click="close">Anuluj</button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing() ? 'Zapisz' : 'Dodaj' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  border: none;
  border-radius: 12px;
  padding: 0;
  max-width: 420px;
  width: 90vw;
  box-shadow: var(--shadow);
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0.4);
}

.modal-content {
  padding: 24px;
}

.modal-content h2 {
  margin: 0 0 20px;
  font-size: 20px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h);
  margin-bottom: 6px;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
  color: var(--text-h);
  background: var(--code-bg);
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
  min-height: 80px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
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

.btn-secondary {
  background: var(--code-bg);
  color: var(--text-h);
}
</style>
