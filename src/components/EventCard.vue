<script setup lang="ts">
import type { EventResponse } from '@/types'

defineProps<{ event: EventResponse }>()

function formatDate(iso?: string): string {
  if (!iso) return 'Date TBA'
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(t?: string): string | null {
  if (!t) return null
  return new Date(`1970-01-01T${t}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <router-link
    :to="`/events/${event.id}`"
    class="event-card"
    :aria-label="`Open ${event.name}`"
  >
    <h3 class="card-title">{{ event.name }}</h3>
    <div class="card-meta">
      <span class="card-date">{{ formatDate(event.date) }}</span>
      <span v-if="formatTime(event.time)" class="card-time"> · {{ formatTime(event.time) }}</span>
    </div>
    <div v-if="event.location?.description" class="card-location">
      <i class="pi pi-map-marker" />
      <span>{{ event.location.description }}</span>
    </div>
    <div class="card-host">by {{ event.creatorUsername }}</div>
  </router-link>
</template>

<style scoped>
.event-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  transition: border-color 120ms ease, transform 120ms ease;
}

.event-card:hover {
  border-color: var(--p-primary-color);
  transform: translateY(-2px);
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.card-meta {
  font-size: 0.875rem;
  color: var(--p-text-secondary-color);
  margin-bottom: 0.5rem;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: var(--p-text-secondary-color);
  margin-bottom: 0.75rem;
}

.card-host {
  font-size: 0.8rem;
  color: var(--p-text-secondary-color);
}
</style>
