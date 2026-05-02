<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getEventByShareToken, deleteEvent, getViewerState,
  type ShareViewerState,
} from '@/services/events'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import EventDetails from '@/components/EventDetails.vue'
import EventTeaser from '@/components/EventTeaser.vue'
import RequestToJoinPanel from '@/components/RequestToJoinPanel.vue'
import PublicRsvpPanel from '@/components/PublicRsvpPanel.vue'
import AttendeeRsvpToggle from '@/components/AttendeeRsvpToggle.vue'
import AttendeeList from '@/components/AttendeeList.vue'
import type { EventResponse, RsvpStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(true)
const notFound = ref(false)
const viewerState = ref<ShareViewerState | null>(null)
const event = ref<EventResponse | null>(null)
const myStatus = ref<RsvpStatus | null>(null)

const canEdit = computed(
  () => !!event.value && authStore.user?.username === event.value.creatorUsername,
)

async function load() {
  loading.value = true
  notFound.value = false
  viewerState.value = null
  event.value = null
  const token = String(route.params.token)
  try {
    viewerState.value = await getViewerState(token)
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    if (status === 404) notFound.value = true
    else toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load shared event.', life: 3000 })
    loading.value = false
    return
  }

  // Always fetch the event details — the privacy-gate on getEventByShareToken
  // returns the full event for any valid share token (Phase 3 contract).
  try {
    event.value = await getEventByShareToken(token)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load event details.', life: 3000 })
  }

  myStatus.value = viewerState.value?.attendeeStatus ?? null
  loading.value = false
}

async function onRequestSubmitted() {
  await load()
}

function goToEdit() {
  if (event.value) router.push(`/events/${event.value.id}/edit`)
}

function confirmDelete() {
  confirm.require({
    message: 'Are you sure you want to delete this event? This cannot be undone.',
    header: 'Delete Event',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel', acceptLabel: 'Delete', acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteEvent(event.value!.id)
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Event deleted.', life: 3000 })
        router.push('/')
      } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete.', life: 3000 })
      }
    },
  })
}

onMounted(load)
watch(() => route.params.token, load)

const showFullView = computed(
  () => viewerState.value?.state === 'approved' || viewerState.value?.state === 'attending',
)
</script>

<template>
  <div class="shared-event">
    <div v-if="loading" class="state">Loading shared event…</div>

    <div v-else-if="notFound" class="state">
      This share link has been revoked or doesn't exist.
    </div>

    <template v-else-if="viewerState && event">
      <template v-if="showFullView">
        <EventDetails :event="event" :can-edit="canEdit" @edit="goToEdit" @delete="confirmDelete" />
        <AttendeeRsvpToggle
          v-if="myStatus"
          :event-id="event.id"
          :status="myStatus"
          @update:status="myStatus = $event"
        />
        <AttendeeList :event-id="event.id" />
      </template>

      <template v-else-if="viewerState.state === 'pending'">
        <EventTeaser :event="event" />
        <div class="state pending-state">
          <p>Your request is pending the host's approval.</p>
          <Button label="Refresh" icon="pi pi-refresh" severity="secondary" @click="load" />
        </div>
      </template>

      <template v-else-if="viewerState.state === 'declined'">
        <EventTeaser :event="event" />
        <div class="state declined-state">Your request was declined.</div>
      </template>

      <template v-else-if="viewerState.state === 'not_requested'">
        <EventTeaser :event="event" />
        <RequestToJoinPanel
          v-if="viewerState.eventIsPrivate"
          :share-token="String(route.params.token)"
          @submitted="onRequestSubmitted"
        />
        <PublicRsvpPanel
          v-else
          :share-token="String(route.params.token)"
          @submitted="onRequestSubmitted"
        />
      </template>
    </template>

    <div v-else class="state">Could not load event.</div>
  </div>
</template>

<style>
.shared-event { max-width: 800px; margin: 0 auto; padding: 2rem; }
.shared-event .state { text-align: center; padding: 2rem; color: var(--p-text-secondary-color); }
.shared-event .pending-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
</style>
