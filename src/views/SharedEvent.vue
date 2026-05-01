<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEventByShareToken, deleteEvent } from '@/services/events'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import EventDetails from '@/components/EventDetails.vue'
import type { EventResponse } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(true)
const notFound = ref(false)
const event = ref<EventResponse | null>(null)

const canEdit = computed(
  () => !!event.value && authStore.user?.username === event.value.creatorUsername,
)

async function load(token: string) {
  loading.value = true
  notFound.value = false
  event.value = null
  try {
    event.value = await getEventByShareToken(token)
  } catch (e: unknown) {
    // 404 is the "revoked or unknown" case — render the explicit empty state.
    // Any other error falls into a generic toast.
    const status = (e as { response?: { status?: number } })?.response?.status
    if (status === 404) {
      notFound.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load shared event.',
        life: 3000,
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => load(String(route.params.token)))
watch(() => route.params.token, (t) => load(String(t)))

function goToEdit() {
  if (event.value) router.push(`/events/${event.value.id}/edit`)
}

function confirmDelete() {
  confirm.require({
    message: 'Are you sure you want to delete this event? This cannot be undone.',
    header: 'Delete Event',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteEvent(event.value!.id)
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Event deleted successfully.',
          life: 3000,
        })
        router.push('/')
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete event. Please try again.',
          life: 3000,
        })
      }
    },
  })
}
</script>

<template>
  <div class="shared-event">
    <div v-if="loading" class="state">Loading shared event…</div>

    <EventDetails
      v-else-if="event"
      :event="event"
      :can-edit="canEdit"
      @edit="goToEdit"
      @delete="confirmDelete"
    />

    <div v-else-if="notFound" class="state">
      This share link has been revoked or doesn't exist.
    </div>

    <div v-else class="state">Could not load event.</div>
  </div>
</template>

<style>
.shared-event {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.shared-event .state {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-secondary-color);
}
</style>
