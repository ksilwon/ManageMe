<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Project } from '../types/project'

const props = defineProps<{
  modelValue: boolean
  project?: Project | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { nazwa: string; opis: string }): void
}>()

const nazwa = ref('')
const opis = ref('')
const dialogRef = ref<HTMLDialogElement | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.project) {
        nazwa.value = props.project.nazwa
        opis.value = props.project.opis
      } else {
        nazwa.value = ''
        opis.value = ''
      }
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
  { immediate: true }
)

const isEditing = () => !!props.project

function handleSubmit() {
  if (!nazwa.value.trim()) return
  emit('submit', { nazwa: nazwa.value.trim(), opis: opis.value.trim() })
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <dialog ref="dialogRef" class="modal" @cancel="close" @close="emit('update:modelValue', false)">
    <div class="modal-content">
      <h2>{{ isEditing() ? 'Edytuj projekt' : 'Nowy projekt' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="nazwa">Nazwa</label>
          <input
            id="nazwa"
            v-model="nazwa"
            type="text"
            required
            placeholder="Nazwa projektu"
            autocomplete="off"
          />
        </div>
        <div class="field">
          <label for="opis">Opis</label>
          <textarea
            id="opis"
            v-model="opis"
            rows="4"
            placeholder="Opis projektu"
          />
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
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  max-width: 420px;
  width: 90%;
  box-shadow: var(--shadow);
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
.field textarea {
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
