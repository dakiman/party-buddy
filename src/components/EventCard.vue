<script setup lang="ts">
import { formatDayBadge, formatFriendlyDate } from '@/utils/datetime'
import type { EventResponse } from '@/types'

defineProps<{
  event: EventResponse
  /** Home passes this — "by <me>" on your own events is noise. */
  hideHost?: boolean
}>()
</script>

<template>
  <router-link
    :to="`/events/${event.id}`"
    class="event-card"
    :aria-label="`Open ${event.name}`"
  >
    <div class="date-badge" aria-hidden="true">
      <template v-if="event.date">
        <span class="badge-month">{{ formatDayBadge(event.date).month }}</span>
        <span class="badge-day">{{ formatDayBadge(event.date).day }}</span>
      </template>
      <template v-else>
        <span class="badge-month">TBA</span>
        <span class="badge-day">?</span>
      </template>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ event.name }}</h3>
      <div class="card-meta">{{ formatFriendlyDate(event.date, event.time) }}</div>
      <div v-if="event.location?.description" class="card-location">
        <i class="pi pi-map-marker" />
        <span>{{ event.location.description }}</span>
      </div>
      <div class="card-footer">
        <span class="pb-pill">
          <i :class="event.isPrivate ? 'pi pi-lock' : 'pi pi-globe'" />
          {{ event.isPrivate ? 'Private' : 'Public' }}
        </span>
        <span v-if="!hideHost" class="card-host">by {{ event.creatorUsername }}</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.event-card {
  display: flex;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--pb-radius-card);
  padding: 1.1rem 1.25rem;
  transition: border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
}

.event-card:hover,
.event-card:focus-visible {
  border-color: var(--p-primary-color);
  transform: translateY(-2px);
  box-shadow: var(--pb-glow-soft);
}

.date-badge {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 12px;
  background: var(--p-surface-900);
  border: 1px solid var(--p-content-border-color);
}

.badge-month {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--p-primary-color);
}

.badge-day {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--p-text-color);
}

.card-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--p-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.card-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  min-width: 0;
}

.card-location span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.card-host {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}
</style>
