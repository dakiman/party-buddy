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

const groups = computed(() => [
  { key: 'going', label: 'Going', icon: 'pi pi-check-circle', people: going.value },
  { key: 'maybe', label: 'Maybe', icon: 'pi pi-question-circle', people: maybe.value },
  { key: 'declined', label: 'Declined', icon: 'pi pi-times-circle', people: declined.value },
].filter(g => g.people.length > 0))
</script>

<template>
  <div v-if="!loading && accessible" class="attendee-list">
    <h3 class="pb-section-label">Attendees</h3>

    <p v-if="attendees.length === 0" class="empty">No RSVPs yet — be the first!</p>

    <div v-else class="groups">
      <div v-for="g in groups" :key="g.key" class="group">
        <div class="group-header">
          <i :class="g.icon" />
          {{ g.label }} ({{ g.people.length }})
        </div>
        <div class="people">
          <div v-for="a in g.people" :key="a.id" class="person">
            <span class="person-avatar" aria-hidden="true">{{ identityLabel(a.identity).charAt(0).toUpperCase() }}</span>
            {{ identityLabel(a.identity) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendee-list {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--pb-radius-card);
  padding: 1.5rem;
  margin-top: 1.25rem;
}

.attendee-list h3 {
  margin: 0 0 1.25rem 0;
}

.empty {
  margin: 0;
  color: var(--p-text-muted-color);
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
  color: var(--p-text-color);
}

.group-header i {
  color: var(--p-primary-color);
}

.people {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.person {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.8rem 0.25rem 0.3rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: 999px;
  background: var(--p-surface-900);
  font-size: 0.875rem;
  color: var(--p-text-color);
}

.person-avatar {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--pb-accent-grad);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
