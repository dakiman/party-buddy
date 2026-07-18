<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEvent } from '@/services/events'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import EventWizard from '@/components/EventWizard.vue'
import type { EventResponse } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const event = ref<EventResponse | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    // Wait for the auth store's init GET /auth/user alongside the event fetch —
    // on a hard reload authStore.user is otherwise still null here and the
    // creator gets bounced off their own edit page.
    const [fetched] = await Promise.all([getEvent(id), authStore.ready])

    // Only the creator may edit. If another authenticated user navigates here
    // directly, redirect them to the read-only event view.
    if (fetched.creatorUsername !== authStore.user?.username) {
      router.replace(`/events/${id}`)
      return
    }

    event.value = fetched
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load event.',
      life: 3000,
    })
    router.replace('/')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="loading-state">
    Loading event...
  </div>

  <!-- The wizard seeds the store from initialEvent in its own onMounted,
       so it must only mount once the event is loaded. -->
  <EventWizard
    v-if="event"
    :initial-event="event"
    @cancel="router.replace(`/events/${event!.id}`)"
  />
</template>

<style scoped>
.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-muted-color);
}
</style>
