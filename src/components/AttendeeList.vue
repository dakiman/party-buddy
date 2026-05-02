<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { listAttendees, type Attendee } from '@/services/events'
import { identityLabel } from '@/utils/identity'

const props = defineProps<{ eventId: number }>()

const toast = useToast()
const attendees = ref<Attendee[]>([])
const loading = ref(true)
const accessible = ref(true)

async function load() {
  loading.value = true
  try {
    attendees.value = await listAttendees(props.eventId)
    accessible.value = true
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    if (status === 403 || status === 401) {
      accessible.value = false
    } else {
      accessible.value = false  // also hide on other errors so we don't render misleading empty columns
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load attendees.',
        life: 3000,
      })
    }
  } finally {
    loading.value = false
  }
}

defineExpose({ refresh: load })

onMounted(load)
watch(() => props.eventId, load)

const going    = computed(() => attendees.value.filter(a => a.status === 'GOING'))
const maybe    = computed(() => attendees.value.filter(a => a.status === 'MAYBE'))
const declined = computed(() => attendees.value.filter(a => a.status === 'DECLINED'))
</script>

<template>
  <div v-if="!loading && accessible" class="attendee-list">
    <h3>Attendees</h3>
    <div class="columns">
      <div class="col">
        <div class="col-header">Going ({{ going.length }})</div>
        <div v-for="a in going" :key="a.id" class="row">{{ identityLabel(a.identity) }}</div>
        <div v-if="going.length === 0" class="empty">—</div>
      </div>
      <div class="col">
        <div class="col-header">Maybe ({{ maybe.length }})</div>
        <div v-for="a in maybe" :key="a.id" class="row">{{ identityLabel(a.identity) }}</div>
        <div v-if="maybe.length === 0" class="empty">—</div>
      </div>
      <div class="col">
        <div class="col-header">Declined ({{ declined.length }})</div>
        <div v-for="a in declined" :key="a.id" class="row">{{ identityLabel(a.identity) }}</div>
        <div v-if="declined.length === 0" class="empty">—</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendee-list {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}
.attendee-list h3 { margin: 0 0 1rem 0; font-size: 1.125rem; }
.columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.col-header { font-weight: 600; margin-bottom: 0.5rem; }
.row { padding: 0.25rem 0; font-size: 0.9rem; }
.empty { color: var(--p-text-secondary-color); }
</style>
