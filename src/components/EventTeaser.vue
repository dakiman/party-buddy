<script setup lang="ts">
import type { EventResponse } from '@/types'
defineProps<{ event: EventResponse }>()

function formatDate(iso?: string): string {
  if (!iso) return 'Date TBA'
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>

<template>
  <div class="event-teaser">
    <h1 class="teaser-title">{{ event.name }}</h1>
    <div class="teaser-meta">
      <div v-if="event.date"><i class="pi pi-calendar" /> {{ formatDate(event.date) }}</div>
      <div v-if="event.location?.description"><i class="pi pi-map-marker" /> {{ event.location.description }}</div>
      <div><i class="pi pi-user" /> hosted by {{ event.creatorUsername }}</div>
    </div>
  </div>
</template>

<style scoped>
.event-teaser {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
.teaser-title { font-size: 1.5rem; margin: 0 0 0.5rem 0; color: var(--p-text-color); }
.teaser-meta { display: flex; flex-direction: column; gap: 0.4rem; color: var(--p-text-secondary-color); }
.teaser-meta div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
