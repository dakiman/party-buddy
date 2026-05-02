<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import {
  listPendingRequests, approveRequest, declineRequest,
  type PendingRequest,
} from '@/services/events'

const props = defineProps<{ eventId: number }>()
const emit = defineEmits<{ decided: [] }>()

const toast = useToast()
const requests = ref<PendingRequest[]>([])
const loading = ref(true)
const acting = ref<Set<number>>(new Set())

async function load() {
  loading.value = true
  try {
    requests.value = await listPendingRequests(props.eventId)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load pending requests.', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function onApprove(req: PendingRequest) {
  acting.value.add(req.id)
  try {
    await approveRequest(props.eventId, req.id)
    requests.value = requests.value.filter(r => r.id !== req.id)
    emit('decided')
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not approve.', life: 3000 })
  } finally {
    acting.value.delete(req.id)
  }
}

async function onDecline(req: PendingRequest) {
  acting.value.add(req.id)
  try {
    await declineRequest(props.eventId, req.id)
    requests.value = requests.value.filter(r => r.id !== req.id)
    emit('decided')
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not decline.', life: 3000 })
  } finally {
    acting.value.delete(req.id)
  }
}

function label(req: PendingRequest): string {
  return req.requester.kind === 'USER'
    ? `@${req.requester.username}`
    : `${req.requester.displayName}#${req.requester.discriminator}`
}

onMounted(load)
watch(() => props.eventId, load)
</script>

<template>
  <div v-if="!loading && requests.length > 0" class="pending-list">
    <h3>Pending requests ({{ requests.length }})</h3>
    <div v-for="req in requests" :key="req.id" class="request-row">
      <div class="info">
        <div class="identity">{{ label(req) }}</div>
        <div v-if="req.requester.contactNote" class="note">{{ req.requester.contactNote }}</div>
        <div class="meta">requested {{ new Date(req.createdAt).toLocaleString() }}</div>
      </div>
      <div class="actions">
        <Button
          label="Approve" icon="pi pi-check"
          :loading="acting.has(req.id)"
          @click="onApprove(req)"
        />
        <Button
          label="Decline" icon="pi pi-times" severity="secondary"
          :loading="acting.has(req.id)"
          @click="onDecline(req)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pending-list {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}
.pending-list h3 { margin: 0 0 1rem 0; font-size: 1.125rem; }
.request-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 0;
  border-top: 1px solid var(--p-surface-border);
}
.request-row:first-of-type { border-top: 0; }
.identity { font-weight: 500; }
.note { color: var(--p-text-secondary-color); font-size: 0.9rem; margin-top: 0.25rem; }
.meta { color: var(--p-text-secondary-color); font-size: 0.8rem; margin-top: 0.25rem; }
.actions { display: flex; gap: 0.5rem; }
</style>
