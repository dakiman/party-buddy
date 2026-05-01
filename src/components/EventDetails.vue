<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import ShareDialog from './ShareDialog.vue'
import type { EventResponse } from '@/types'

defineProps<{
  event: EventResponse
  canEdit: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const shareDialogOpen = ref(false)
</script>

<template>
  <div>
    <h1 class="event-title">{{ event.name }}</h1>

    <div v-if="canEdit" class="event-actions">
      <Button label="Share" icon="pi pi-share-alt" @click="shareDialogOpen = true" />
      <Button label="Edit"   icon="pi pi-pencil"  @click="emit('edit')" />
      <Button label="Delete" icon="pi pi-trash"   severity="danger" @click="emit('delete')" />
    </div>

    <div class="event-section">
      <h2>Time & Place</h2>
      <div class="section-content">
        <div class="info-field">
          <label>Event Type:</label>
          <span>{{ event.isPrivate ? 'Private Party' : 'Public Event' }}</span>
        </div>

        <div class="info-field" v-if="event.date">
          <label>Date:</label>
          <span>{{ new Date(event.date).toLocaleDateString() }}</span>
        </div>

        <div class="info-field" v-if="event.time">
          <label>Time:</label>
          <span>{{ new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }) }}</span>
        </div>

        <div class="info-field" v-if="event.location">
          <label>Location:</label>
          <div class="location-info">
            <span v-if="event.location.description">
              {{ event.location.description }}
            </span>
            <span v-if="event.location.latitude && event.location.longitude">
              {{ event.location.latitude.toFixed(6) }}, {{ event.location.longitude.toFixed(6) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="event-section" v-if="event.artists?.length">
      <h2>Music</h2>
      <div class="section-content">
        <div class="info-field">
          <label>Artists:</label>
          <div class="chips-container">
            <div v-for="artist in event.artists" :key="artist.id" class="info-chip">
              <img :src="artist.images[2]?.url" class="chip-image" :alt="artist.name" />
              {{ artist.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="event-section" v-if="event.ingredients?.length || event.food?.length">
      <h2>Drinks & Food</h2>
      <div class="section-content">
        <div class="info-field" v-if="event.ingredients?.length">
          <label>Drinks:</label>
          <div class="chips-container">
            <div v-for="drink in event.ingredients" :key="drink.id" class="info-chip">
              <img
                :src="`https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(drink.name)}-Small.png`"
                class="chip-image"
                :alt="drink.name"
              />
              {{ drink.name }}
            </div>
          </div>
        </div>

        <div class="info-field" v-if="event.food?.length">
          <label>Food & Snacks:</label>
          <div class="chips-container">
            <div v-for="food in event.food" :key="food" class="info-chip">
              {{ food }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <ShareDialog
      v-if="canEdit"
      v-model:visible="shareDialogOpen"
      :event-id="event.id"
    />
  </div>
</template>

<style scoped>
.event-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin-bottom: 2rem;
}

.event-section {
  background: var(--p-surface-card);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--p-surface-border);
}

.event-section h2 {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--p-text-color);
  margin: 0 0 1.5rem 0;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-field {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-field label {
  font-weight: 500;
  color: var(--p-text-color);
  min-width: 120px;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--p-primary-color);
  color: var(--p-rimary-color-text);
  border-radius: 1rem;
  font-size: 0.875rem;
}

.chip-image {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  object-fit: cover;
}

.event-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
</style>
