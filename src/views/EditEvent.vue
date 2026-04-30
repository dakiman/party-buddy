<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
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
const wizardRef = ref<InstanceType<typeof EventWizard> | null>(null)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const fetched = await getEvent(id)

    // Only the creator may edit. If another authenticated user navigates here
    // directly, redirect them to the read-only event view.
    if (fetched.creatorUsername !== authStore.user?.username) {
      router.replace(`/events/${id}`)
      return
    }

    event.value = fetched
    // Wait for Vue to mount the EventWizard (gated by `v-if="event"`) before
    // calling its imperative show(). Without nextTick, wizardRef is still null
    // at this point and the dialog never opens.
    await nextTick()
    wizardRef.value?.show()
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

function onWizardClose() {
  // If the wizard is dismissed without saving, go back to the read-only view.
  if (event.value) {
    router.replace(`/events/${event.value.id}`)
  } else {
    router.replace('/')
  }
}
</script>

<template>
  <div class="edit-event-view">
    <div v-if="loading" class="loading-state">
      Loading event...
    </div>

    <!-- EventWizard is rendered as soon as we have the event.
         It opens itself via wizardRef.show() in onMounted.
         @hide fires when the dialog is closed (X button or backdrop) without saving.
         handleFinish inside the wizard navigates away after a successful PUT. -->
    <EventWizard
      v-if="event"
      ref="wizardRef"
      :initial-event="event"
      @hide="onWizardClose"
    />
  </div>
</template>

<style scoped>
.edit-event-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-secondary-color);
}
</style>
