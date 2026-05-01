<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEvent, deleteEvent } from '@/services/events'
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
const event = ref<EventResponse | null>(null)

const canEdit = computed(
  () => !!event.value && authStore.user?.username === event.value.creatorUsername,
)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    event.value = await getEvent(id)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load event details',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
})

function goToEdit() {
  if (event.value) {
    router.push(`/events/${event.value.id}/edit`)
  }
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
  <div class="event-view">
    <div v-if="loading" class="loading-state">
      Loading event details...
    </div>

    <EventDetails
      v-else-if="event"
      :event="event"
      :can-edit="canEdit"
      @edit="goToEdit"
      @delete="confirmDelete"
    />

    <div v-else class="error-state">
      Event not found
    </div>
  </div>
</template>

<style>
.event-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-secondary-color);
}
</style>
