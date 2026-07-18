<script setup lang="ts">
import { formatFriendlyDate } from '@/utils/datetime'
import type { EventResponse } from '@/types'
defineProps<{ event: EventResponse }>()
</script>

<template>
  <div class="event-teaser">
    <span class="pb-pill">
      <i :class="event.isPrivate ? 'pi pi-lock' : 'pi pi-globe'" />
      {{ event.isPrivate ? 'Private Party' : 'Public Event' }}
    </span>
    <h1 class="teaser-title pb-gradient-text">{{ event.name }}</h1>
    <div class="teaser-meta">
      <div v-if="event.date"><i class="pi pi-calendar" /> {{ formatFriendlyDate(event.date, event.time) }}</div>
      <div v-if="event.location?.description"><i class="pi pi-map-marker" /> {{ event.location.description }}</div>
      <div><i class="pi pi-user" /> hosted by {{ event.creatorUsername }}</div>
    </div>
  </div>
</template>

<style scoped>
.event-teaser {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--pb-radius-card);
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}

.teaser-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  overflow-wrap: anywhere;
}

.teaser-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: var(--p-text-muted-color);
}

.teaser-meta div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.teaser-meta i {
  color: var(--p-primary-color);
}
</style>
