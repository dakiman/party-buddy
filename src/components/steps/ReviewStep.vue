<script setup lang="ts">
import { useWizardStore } from '@/stores/wizard'

const wizardStore = useWizardStore()
</script>

<template>
  <div class="review-step">
    <h3 class="text-xl mb-4">Review your event details</h3>
    
    <div class="review-section">
      <h4>Event Type</h4>
      <div class="review-field">
        <label>Type:</label>
        <span>{{ wizardStore.formData.isPrivate ? 'Private Party' : 'Public Event' }}</span>
      </div>
    </div>

    <div class="review-section">
      <h4>Time & Place</h4>
      <div class="review-field" v-if="wizardStore.formData.date">
        <label>Date:</label>
        <span>{{ new Date(wizardStore.formData.date).toLocaleDateString() }}</span>
      </div>
      <div class="review-field" v-if="wizardStore.formData.time">
        <label>Time:</label>
        <span>{{ new Date(wizardStore.formData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
      </div>
      <div class="review-field" v-if="wizardStore.formData.location || wizardStore.formData.locationDescription">
        <label>Location:</label>
        <div class="location-info">
          <span v-if="wizardStore.formData.locationDescription">{{ wizardStore.formData.locationDescription }}</span>
          <span v-if="wizardStore.formData.location">{{ wizardStore.formData.location.lat.toFixed(6) }}, {{ wizardStore.formData.location.lng.toFixed(6) }}</span>
        </div>
      </div>
    </div>

    <div class="review-section" v-if="wizardStore.formData.artists.length">
      <h4>Music</h4>
      <div class="review-field">
        <label>Artists:</label>
        <div class="review-chips">
          <div v-for="artist in wizardStore.formData.artists" :key="artist.id" class="review-chip">
            <img :src="artist.images[2]?.url" class="chip-image" :alt="artist.name" />
            {{ artist.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="review-section">
      <h4>Drinks & Food</h4>
      <div class="review-field" v-if="wizardStore.formData.drinks.length">
        <label>Drinks:</label>
        <div class="review-chips">
          <div v-for="drink in wizardStore.formData.drinks" :key="drink.id" class="review-chip">
            <img :src="`https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(drink.name)}-Small.png`" 
                 class="chip-image" :alt="drink.name" />
            {{ drink.name }}
          </div>
        </div>
      </div>
      <div class="review-field" v-if="wizardStore.formData.food.length">
        <label>Food & Snacks:</label>
        <div class="review-chips">
          <div v-for="food in wizardStore.formData.food" :key="food" class="review-chip">
            {{ food }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.review-step {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-section h4 {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--p-text-color);
  margin-bottom: 0.5rem;
}

.review-field {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.review-field label {
  font-weight: 500;
  color: var(--p-text-color);
  min-width: 120px;
}

.review-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--p-primary-color);
  color: var(--primary-color-text);
  border-radius: 1rem;
  font-size: 0.875rem;
}

.review-chip .chip-image {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  object-fit: cover;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style> 