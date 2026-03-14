import { ref, watch } from 'vue'
import { activeProjectApi } from '../api/activeProjectApi'

const activeProjectId = ref<string | null>(null)
let initialized = false

async function init() {
  if (initialized) return
  activeProjectId.value = await activeProjectApi.get()
  initialized = true
}

watch(activeProjectId, async (id) => {
  await activeProjectApi.set(id)
})

export function useActiveProject() {
  return {
    activeProjectId,
    setActiveProject: (id: string | null) => {
      activeProjectId.value = id
    },
    initActiveProject: init,
  }
}
