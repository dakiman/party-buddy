<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import ToggleButton from 'primevue/togglebutton'
import Paginator from 'primevue/paginator'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { listPublicEvents } from '@/services/events'
import EventCard from '@/components/EventCard.vue'
import type { EventResponse } from '@/types'

const PAGE_SIZE = 20

const route = useRoute()
const router = useRouter()
const toast = useToast()

const q = ref<string>(typeof route.query.q === 'string' ? route.query.q : '')
const page = ref<number>(typeof route.query.page === 'string' ? Number(route.query.page) || 0 : 0)
const showPast = ref<boolean>(route.query.showPast === 'true')

const loading = ref(false)
const errored = ref(false)
const events = ref<EventResponse[]>([])
const total = ref(0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let currentRequestId = 0

async function fetchPage() {
  const requestId = ++currentRequestId
  loading.value = true
  errored.value = false
  try {
    const res = await listPublicEvents({
      page: page.value,
      size: PAGE_SIZE,
      q: q.value.trim() || undefined,
      includePast: showPast.value,
    })
    if (requestId !== currentRequestId) return // a newer request superseded us
    events.value = res.content
    total.value = res.totalElements
  } catch {
    if (requestId !== currentRequestId) return
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load events.',
      life: 3000,
    })
    errored.value = true
  } finally {
    if (requestId === currentRequestId) loading.value = false
  }
}

function syncQueryParams() {
  router.replace({
    query: {
      ...(q.value ? { q: q.value } : {}),
      ...(page.value ? { page: String(page.value) } : {}),
      ...(showPast.value ? { showPast: 'true' } : {}),
    },
  })
}

watch(q, () => {
  page.value = 0
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    syncQueryParams()
    fetchPage()
  }, 300)
})

watch(showPast, () => {
  page.value = 0
  syncQueryParams()
  fetchPage()
})

function onPaginate(e: { page: number }) {
  page.value = e.page
  syncQueryParams()
  fetchPage()
}

const emptyMessage = computed(() => {
  if (loading.value) return ''
  if (q.value.trim()) return `No events match "${q.value}".`
  return 'No public events yet.'
})

onMounted(fetchPage)
</script>

<template>
  <div class="discover">
    <h1 class="page-title">Discover events</h1>

    <div class="controls">
      <InputText v-model="q" placeholder="Search by name…" fluid />
      <ToggleButton v-model="showPast" on-label="Past events" off-label="Past events" />
    </div>

    <div v-if="loading" class="card-grid" aria-label="Loading events">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <Skeleton width="60%" height="1.25rem" class="skeleton-title" />
        <Skeleton width="40%" height="0.875rem" class="skeleton-meta" />
        <Skeleton width="80%" height="0.875rem" class="skeleton-location" />
        <Skeleton width="30%" height="0.75rem" class="skeleton-host" />
      </div>
    </div>

    <div v-else-if="errored" class="state error-state">
      <p>Failed to load events.</p>
      <Button label="Retry" icon="pi pi-refresh" @click="fetchPage" />
    </div>

    <div v-else-if="events.length === 0" class="state">{{ emptyMessage }}</div>

    <div v-else class="card-grid">
      <EventCard v-for="ev in events" :key="ev.id" :event="ev" />
    </div>

    <Paginator
      v-if="total > PAGE_SIZE"
      :rows="PAGE_SIZE"
      :total-records="total"
      :first="page * PAGE_SIZE"
      @page="onPaginate"
    />
  </div>
</template>

<style>
.discover {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.discover .page-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--p-text-color);
}

.discover .controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.discover .controls > :first-child {
  flex: 1;
}

.discover .card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.discover .state {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-secondary-color);
}

.discover .skeleton-card {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.discover .skeleton-title { margin-bottom: 0.25rem; }
</style>
