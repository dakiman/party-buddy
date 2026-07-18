<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '@/stores/wizard'
import { formatFriendlyDate, formatLocalDate, formatLocalTime } from '@/utils/datetime'

const wizardStore = useWizardStore()

const friendlyWhen = computed(() => {
  const { date, time } = wizardStore.formData
  if (!date) return null
  return formatFriendlyDate(
    formatLocalDate(date),
    time ? formatLocalTime(time) : undefined,
  )
})
</script>

<template>
  <div class="review-step">
    <!-- Invitation preview -->
    <div class="preview-card">
      <span class="pb-pill">
        <i :class="wizardStore.formData.isPrivate ? 'pi pi-lock' : 'pi pi-globe'" />
        {{ wizardStore.formData.isPrivate ? 'Private Party' : 'Public Event' }}
      </span>
      <h3 class="preview-title pb-gradient-text">{{ wizardStore.formData.name || 'Untitled party' }}</h3>
      <div class="preview-meta" v-if="friendlyWhen">
        <i class="pi pi-calendar" />
        {{ friendlyWhen }}
      </div>
      <div class="preview-meta" v-if="wizardStore.formData.locationDescription || wizardStore.formData.location">
        <i class="pi pi-map-marker" />
        <span v-if="wizardStore.formData.locationDescription">{{ wizardStore.formData.locationDescription }}</span>
        <span v-else-if="wizardStore.formData.location" class="coords">
          {{ wizardStore.formData.location.lat.toFixed(6) }}, {{ wizardStore.formData.location.lng.toFixed(6) }}
        </span>
      </div>
    </div>

    <div class="review-section" v-if="wizardStore.formData.enabledSteps.music && wizardStore.formData.artists.length">
      <h4 class="pb-section-label">Music</h4>
      <div class="review-chips">
        <div v-for="artist in wizardStore.formData.artists" :key="artist.id" class="review-chip">
          <img :src="artist.images[2]?.url" class="chip-image" :alt="artist.name" />
          {{ artist.name }}
        </div>
      </div>
    </div>

    <template v-if="wizardStore.formData.enabledSteps.drinksAndFood">
      <div class="review-section" v-if="wizardStore.formData.ingredients.length">
        <h4 class="pb-section-label">Bar</h4>
        <div class="review-chips">
          <div v-for="ing in wizardStore.formData.ingredients" :key="ing.id" class="review-chip">
            <img :src="`https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ing.name)}-Small.png`"
                 class="chip-image" :alt="ing.name" />
            {{ ing.name }}
          </div>
        </div>
      </div>

      <div class="review-section" v-if="wizardStore.formData.cocktails.length">
        <h4 class="pb-section-label">Cocktails</h4>
        <div class="review-chips">
          <div v-for="cocktail in wizardStore.formData.cocktails" :key="cocktail.id" class="review-chip">
            <img v-if="cocktail.thumbnail" :src="cocktail.thumbnail" class="chip-image" :alt="cocktail.name" />
            {{ cocktail.name }}
          </div>
        </div>
      </div>

      <div class="review-section" v-if="wizardStore.formData.food.length">
        <h4 class="pb-section-label">Food &amp; Snacks</h4>
        <div class="review-chips">
          <div v-for="food in wizardStore.formData.food" :key="food" class="review-chip">
            {{ food }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.review-step {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  background: var(--p-surface-900);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--pb-radius-card);
  padding: 1.5rem;
}

.preview-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
  overflow-wrap: anywhere;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--p-text-color);
}

.preview-meta i {
  color: var(--p-primary-color);
}

.preview-meta .coords {
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  padding: 0.3rem 0.8rem;
  background-color: var(--p-surface-800);
  color: var(--p-text-color);
  border: 1px solid var(--p-content-border-color);
  border-radius: 999px;
  font-size: 0.875rem;
}

.review-chip .chip-image {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  object-fit: cover;
}
</style>
