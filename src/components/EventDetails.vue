<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import ShareDialog from './ShareDialog.vue'
import { formatFriendlyDate } from '@/utils/datetime'
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
const moreMenu = ref()

const moreItems = [
  {
    label: 'Delete event',
    icon: 'pi pi-trash',
    class: 'danger-item',
    command: () => emit('delete'),
  },
]

function fullDate(iso?: string): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

</script>

<template>
  <div>
    <!-- Hero -->
    <div class="hero">
      <span class="pb-pill">
        <i :class="event.isPrivate ? 'pi pi-lock' : 'pi pi-globe'" />
        {{ event.isPrivate ? 'Private Party' : 'Public Event' }}
      </span>
      <h1 class="event-title pb-gradient-text">{{ event.name }}</h1>
      <div class="hero-meta">
        <i class="pi pi-calendar" />
        {{ formatFriendlyDate(event.date, event.time) }}
      </div>
      <div class="hero-host">Hosted by {{ event.creatorUsername }}</div>
    </div>

    <div v-if="canEdit" class="event-actions">
      <Button label="Share" icon="pi pi-share-alt" class="share-button" @click="shareDialogOpen = true" />
      <Button label="Edit" icon="pi pi-pencil" severity="secondary" outlined @click="emit('edit')" />
      <Button
        icon="pi pi-ellipsis-h"
        severity="secondary"
        text
        aria-label="More actions"
        @click="moreMenu.toggle($event)"
      />
      <Menu ref="moreMenu" :model="moreItems" popup class="pb-popup-menu" appendTo="body" />
    </div>

    <!-- When & Where -->
    <div class="event-section">
      <h2 class="pb-section-label">When &amp; Where</h2>
      <div class="icon-rows">
        <div class="icon-row" v-if="event.date">
          <div class="icon-tile"><i class="pi pi-calendar" /></div>
          <div class="row-text">
            <div class="row-primary">{{ formatFriendlyDate(event.date, event.time) }}</div>
            <div class="row-secondary">{{ fullDate(event.date) }}</div>
          </div>
        </div>
        <div class="icon-row" v-if="event.location">
          <div class="icon-tile"><i class="pi pi-map-marker" /></div>
          <div class="row-text">
            <div class="row-primary" v-if="event.location.description">{{ event.location.description }}</div>
            <div class="row-secondary" v-if="event.location.latitude && event.location.longitude">
              {{ event.location.latitude.toFixed(6) }}, {{ event.location.longitude.toFixed(6) }}
            </div>
          </div>
        </div>
        <div class="icon-row" v-if="!event.date && !event.location">
          <div class="icon-tile"><i class="pi pi-question" /></div>
          <div class="row-text">
            <div class="row-primary">Details coming soon</div>
          </div>
        </div>
      </div>
    </div>

    <div class="event-section" v-if="event.artists?.length">
      <h2 class="pb-section-label">Music</h2>
      <div class="chips-container">
        <div v-for="artist in event.artists" :key="artist.id" class="info-chip">
          <img :src="artist.images[2]?.url" class="chip-image" :alt="artist.name" />
          {{ artist.name }}
        </div>
      </div>
    </div>

    <!-- Cocktails — new in Phase 7 -->
    <div class="event-section" v-if="event.drinks?.length">
      <h2 class="pb-section-label">Cocktails</h2>
      <div class="cocktail-cards">
        <div v-for="cocktail in event.drinks" :key="cocktail.id" class="cocktail-card">
          <div class="cocktail-card-header">
            <img v-if="cocktail.thumbnail" :src="cocktail.thumbnail" class="cocktail-thumb"
                 :alt="cocktail.name" />
            <h3 class="cocktail-name">{{ cocktail.name }}</h3>
          </div>
          <p v-if="cocktail.recipe" class="cocktail-recipe">{{ cocktail.recipe }}</p>
          <ul v-if="cocktail.ingredients?.length" class="cocktail-ingredients">
            <li v-for="ing in cocktail.ingredients" :key="ing.name">
              <span v-if="ing.amount" class="ingredient-amount">{{ ing.amount }}</span>
              <span class="ingredient-name">{{ ing.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bar (alcohols on hand) + Food — relabeled from "Drinks & Food" -->
    <div class="event-section" v-if="event.ingredients?.length || event.food?.length">
      <h2 class="pb-section-label">Bar &amp; Food</h2>
      <div class="section-content">
        <div class="sub-group" v-if="event.ingredients?.length">
          <span class="sub-label">Alcohols on hand</span>
          <div class="chips-container">
            <div v-for="ing in event.ingredients" :key="ing.id" class="info-chip">
              <img
                :src="`https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ing.name)}-Small.png`"
                class="chip-image"
                :alt="ing.name"
              />
              {{ ing.name }}
            </div>
          </div>
        </div>

        <div class="sub-group" v-if="event.food?.length">
          <span class="sub-label">Food &amp; Snacks</span>
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
.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.event-title {
  font-size: clamp(2rem, 5vw, 2.6rem);
  font-weight: 800;
  line-height: 1.12;
  margin: 0;
  overflow-wrap: anywhere;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: var(--p-text-color);
}

.hero-meta i {
  color: var(--p-primary-color);
}

.hero-host {
  font-size: 0.95rem;
  color: var(--p-text-muted-color);
}

.event-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.share-button {
  box-shadow: var(--pb-glow);
}

.event-section {
  background: var(--p-content-background);
  border-radius: var(--pb-radius-card);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--p-content-border-color);
}

.event-section .pb-section-label {
  display: block;
  margin: 0 0 1.25rem 0;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.icon-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.icon-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-tile {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--p-surface-900);
  border: 1px solid var(--p-content-border-color);
}

.icon-tile i {
  color: var(--p-primary-color);
  font-size: 1.1rem;
}

.row-primary {
  font-size: 1rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.row-secondary {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  margin-top: 0.15rem;
}

.sub-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.sub-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
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
  padding: 0.3rem 0.8rem;
  background-color: var(--p-surface-800);
  color: var(--p-text-color);
  border: 1px solid var(--p-content-border-color);
  border-radius: 999px;
  font-size: 0.875rem;
}

.chip-image {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  object-fit: cover;
}

.cocktail-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.cocktail-card {
  border: 1px solid var(--p-content-border-color);
  border-radius: 12px;
  padding: 1rem;
  background-color: var(--p-surface-900);
}
.cocktail-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.cocktail-thumb {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--p-content-border-color);
  box-shadow: var(--pb-glow-soft);
}
.cocktail-name {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}
.cocktail-recipe {
  margin: 0 0 0.75rem 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--p-text-muted-color);
}
.cocktail-ingredients {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.cocktail-ingredients .ingredient-amount {
  font-weight: 500;
  margin-right: 0.5rem;
  display: inline-block;
  min-width: 4rem;
}
</style>
