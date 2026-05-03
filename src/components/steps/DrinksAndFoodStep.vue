<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useWizardStore } from '@/stores/wizard'
import api from '@/services/api'
import { getDrinksByIngredients } from '@/services/drinks'
import type { Cocktail } from '@/types'
import type { IngredientPick } from '@/stores/wizard'

const wizardStore = useWizardStore()

// ─── Ingredient picker state (existing) ───────────────────────────────────
const ingredientSearchResults = ref<IngredientPick[]>([])
const selectedIngredients = ref<IngredientPick[]>([...wizardStore.formData.ingredients])
const loadingIngredients = ref(false)

// ─── Cocktail suggestions state (new) ────────────────────────────────────
const suggestions = ref<Cocktail[]>([])
const loadingSuggestions = ref(false)
const suggestionsError = ref<string | null>(null)
const expandedCocktailIds = ref<Set<number>>(new Set())
const selectedCocktails = ref<Cocktail[]>([...wizardStore.formData.cocktails])

// ─── Food state (existing) ───────────────────────────────────────────────
const foodSearchResults = ref<string[]>([])
const selectedFood = ref<string[]>([...wizardStore.formData.food])
const foodOptions = [
  'Chips', 'Popcorn', 'Pizza', 'Nachos', 'Pretzels',
  'Sandwiches', 'Cheese Platter', 'Fruit Platter',
  'Cookies', 'Brownies', 'Nuts', 'Candy',
]

const getIngredientImageUrl = (name: string) =>
  `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(name)}-Small.png`

const searchIngredients = async (event: { query: string }) => {
  try {
    loadingIngredients.value = true
    const response = await api.get('/ingredients', {
      params: { isAlcoholic: true, name: event.query },
    })
    const existingIds = selectedIngredients.value.map(i => i.id)
    ingredientSearchResults.value = response.data.ingredients.filter(
      (i: IngredientPick) => !existingIds.includes(i.id),
    )
  } catch (error) {
    console.error('Error searching ingredients:', error)
    ingredientSearchResults.value = []
  } finally {
    loadingIngredients.value = false
  }
}

const searchFood = (event: { query: string }) => {
  const query = event.query.toLowerCase()
  const available = foodOptions.filter(f => !selectedFood.value.includes(f))
  foodSearchResults.value = available.filter(f => f.toLowerCase().includes(query))
}

const removeIngredient = (ing: IngredientPick) => {
  selectedIngredients.value = selectedIngredients.value.filter(i => i.id !== ing.id)
}

const removeFood = (food: string) =>
  (selectedFood.value = selectedFood.value.filter(f => f !== food))

// ─── Suggestions: debounced fetch on ingredient changes ─────────────────
const SUGGESTIONS_DEBOUNCE_MS = 300
let suggestionsTimer: number | undefined

// Sort + empty-join: cheap stable key for the watcher. Safe because alcohol
// names from CocktailDB are never prefix-of-each-other.
const ingredientNamesSorted = computed(() =>
  [...selectedIngredients.value.map(i => i.name)].sort().join(''),
)

async function fetchSuggestions() {
  if (selectedIngredients.value.length === 0) {
    suggestions.value = []
    suggestionsError.value = null
    return
  }
  loadingSuggestions.value = true
  suggestionsError.value = null
  try {
    suggestions.value = await getDrinksByIngredients(
      selectedIngredients.value.map(i => i.name),
    )
  } catch (e) {
    console.error('Error loading cocktail suggestions:', e)
    suggestionsError.value = "Couldn't load suggestions"
  } finally {
    loadingSuggestions.value = false
  }
}

watch(ingredientNamesSorted, () => {
  window.clearTimeout(suggestionsTimer)
  suggestionsTimer = window.setTimeout(fetchSuggestions, SUGGESTIONS_DEBOUNCE_MS)
})

onMounted(() => {
  if (selectedIngredients.value.length > 0) fetchSuggestions()
})

onUnmounted(() => window.clearTimeout(suggestionsTimer))

// ─── Cocktail selection / expansion ───────────────────────────────────────
const isSelected = (cocktail: Cocktail) =>
  selectedCocktails.value.some(c => c.id === cocktail.id)

const toggleCocktail = (cocktail: Cocktail) => {
  if (isSelected(cocktail)) {
    selectedCocktails.value = selectedCocktails.value.filter(c => c.id !== cocktail.id)
  } else {
    selectedCocktails.value = [...selectedCocktails.value, cocktail]
  }
}

const removeCocktail = (cocktail: Cocktail) =>
  (selectedCocktails.value = selectedCocktails.value.filter(c => c.id !== cocktail.id))

const toggleExpanded = (id: number) => {
  const next = new Set(expandedCocktailIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedCocktailIds.value = next
}

// ─── Sync to store ───────────────────────────────────────────────────────
watch([selectedIngredients, selectedCocktails, selectedFood],
  ([ings, cocks, foods]) => {
    wizardStore.updateFormData({
      ingredients: ings,
      cocktails: cocks,
      food: foods,
    })
  },
  { deep: true },
)
</script>

<template>
  <div class="drinks-food-step">
    <h3 class="text-xl mb-4">Add drinks and snacks</h3>

    <!-- Drinks (alcohols on hand) ─────────────────────────────────────── -->
    <div class="form-field">
      <label>Drinks (alcohols on hand)</label>
      <AutoComplete
        v-model="selectedIngredients"
        :suggestions="ingredientSearchResults"
        @complete="searchIngredients"
        :multiple="true"
        :delay="300"
        :loading="loadingIngredients"
        optionLabel="name"
        placeholder="Type to search alcohols..."
        appendTo="body"
        class="w-full"
      >
        <template #option="slotProps">
          <div class="item-option">
            <div class="item-info">
              <img :src="getIngredientImageUrl(slotProps.option.name)" class="item-image"
                   :alt="slotProps.option.name" />
              <span class="item-name">{{ slotProps.option.name }}</span>
            </div>
            <div class="type-pills" v-if="slotProps.option.type">
              <Tag :value="slotProps.option.type">{{ slotProps.option.type }}</Tag>
            </div>
          </div>
        </template>
        <template #chip="slotProps">
          <div class="item-chip">
            <img :src="getIngredientImageUrl(slotProps.value.name)" class="chip-image"
                 :alt="slotProps.value.name" />
            <span>{{ slotProps.value.name }}</span>
            <i class="pi pi-times remove-icon" @click.stop="removeIngredient(slotProps.value)" />
          </div>
        </template>
      </AutoComplete>
    </div>

    <!-- Selected cocktails (chip row) ─────────────────────────────────── -->
    <div class="form-field" v-if="selectedCocktails.length">
      <label>Selected cocktails</label>
      <div class="chips-row">
        <div v-for="c in selectedCocktails" :key="c.id" class="cocktail-chip">
          <img v-if="c.thumbnail" :src="c.thumbnail" class="chip-image" :alt="c.name" />
          <span>{{ c.name }}</span>
          <i class="pi pi-times remove-icon" @click.stop="removeCocktail(c)" />
        </div>
      </div>
    </div>

    <!-- Suggested cocktails ──────────────────────────────────────────── -->
    <div class="form-field">
      <label>Suggested cocktails</label>

      <p v-if="selectedIngredients.length === 0" class="empty-hint">
        Pick some alcohols above to see cocktail suggestions.
      </p>

      <div v-else-if="loadingSuggestions && suggestions.length === 0" class="suggestions-loading">
        <Skeleton v-for="n in 3" :key="n" height="3rem" class="mb-2" />
      </div>

      <div v-else-if="suggestionsError" class="suggestions-error">
        <span>{{ suggestionsError }}</span>
        <Button label="Retry" size="small" severity="secondary" @click="fetchSuggestions" />
      </div>

      <div v-else-if="suggestions.length > 0" class="suggestions-list">
        <div
          v-for="cocktail in suggestions"
          :key="cocktail.id"
          class="suggestion-row"
          :class="{ expanded: expandedCocktailIds.has(cocktail.id) }"
        >
          <div class="suggestion-summary" @click="toggleExpanded(cocktail.id)">
            <img v-if="cocktail.thumbnail" :src="cocktail.thumbnail" class="suggestion-thumb"
                 :alt="cocktail.name" />
            <div class="suggestion-name">{{ cocktail.name }}</div>
            <div class="suggestion-badge">
              <Tag v-if="cocktail.fullyMakeable" severity="success" value="Have all alcohols" />
              <Tag v-else severity="warn"
                   :value="`Missing: ${cocktail.missingAlcoholicIngredients?.join(', ') ?? ''}`" />
            </div>
            <Button
              :label="isSelected(cocktail) ? 'Added' : 'Add'"
              :icon="isSelected(cocktail) ? 'pi pi-check' : 'pi pi-plus'"
              size="small"
              :severity="isSelected(cocktail) ? 'success' : 'secondary'"
              @click.stop="toggleCocktail(cocktail)"
            />
          </div>

          <div v-if="expandedCocktailIds.has(cocktail.id)" class="suggestion-details">
            <p v-if="cocktail.recipe" class="recipe-text">{{ cocktail.recipe }}</p>
            <ul v-if="cocktail.ingredients?.length" class="ingredient-list">
              <li v-for="ing in cocktail.ingredients" :key="ing.name">
                <span v-if="ing.amount" class="ingredient-amount">{{ ing.amount }}</span>
                <span class="ingredient-name">{{ ing.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p v-else class="empty-hint">No cocktail matches yet — try picking another alcohol.</p>
    </div>

    <!-- Food & Snacks ────────────────────────────────────────────────── -->
    <div class="form-field">
      <label>Food & Snacks</label>
      <AutoComplete
        v-model="selectedFood"
        :suggestions="foodSearchResults"
        @complete="searchFood"
        :multiple="true"
        :delay="300"
        placeholder="Type to search food..."
        appendTo="body"
        class="w-full"
      >
        <template #option="slotProps">
          <div class="item-option">
            <div class="item-info">
              <span class="item-name">{{ slotProps.option }}</span>
            </div>
          </div>
        </template>
        <template #chip="slotProps">
          <div class="item-chip">
            <span>{{ slotProps.value }}</span>
            <i class="pi pi-times remove-icon" @click.stop="removeFood(slotProps.value)" />
          </div>
        </template>
      </AutoComplete>
    </div>
  </div>
</template>

<style>
.drinks-food-step {
    min-height: 300px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.form-field label {
    font-weight: 500;
    color: var(--p-text-color);
}

.item-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    width: 100%;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.item-image {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
}

.item-name {
    font-size: 0.875rem;
    font-weight: 500;
}

.type-pills {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
}

.item-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.125rem 0.5rem 0.125rem 0.5rem;
    background-color: var(--p-primary-color);
    color: var(--primary-color-text);
    border-radius: 1rem;
    font-size: 0.75rem;
    white-space: nowrap;
}

.chip-image {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    object-fit: cover;
}

.remove-icon {
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.25rem;
    margin-left: 0.25rem;
    color: var(--primary-color-text);
    opacity: 0.7;
    transition: opacity 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.remove-icon:hover {
    opacity: 1;
}

.p-autocomplete {
    width: 100%;
}

.p-autocomplete-input {
    width: 100%;
    background-color: transparent;
    border: 1px solid var(--p-surface-border);
    color: var(--p-text-color);
}

.p-autocomplete-panel {
    background-color: var(--p-surface-overlay);
    border: 1px solid var(--p-surface-border);
    color: var(--p-text-color);
}

.p-autocomplete-items {
    padding: 0.5rem;
}

.p-autocomplete-item {
    padding: 0;
    border-radius: 6px;
}

.p-autocomplete-item:hover {
    background-color: var(--p-surface-hover);
}

.p-autocomplete-token {
    background-color: var(--p-primary-color);
    border-radius: 4px;
    margin: 2px;
    padding: 0;
}

.p-autocomplete-token-icon {
    display: none;
}

/* Selected cocktails chip row */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.cocktail-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--p-primary-color);
  color: var(--p-primary-color-text);
  border-radius: 1rem;
  font-size: 0.875rem;
}

/* Suggestions panel */
.empty-hint {
  color: var(--p-text-muted-color, var(--p-text-color));
  font-size: 0.875rem;
  margin: 0;
}
.suggestions-loading { display: flex; flex-direction: column; gap: 0.5rem; }
.suggestions-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--p-surface-100, #f3f4f6);
  border: 1px dashed var(--p-surface-border);
  border-radius: 6px;
  font-size: 0.875rem;
}
.suggestions-list { display: flex; flex-direction: column; gap: 0.5rem; }
.suggestion-row {
  border: 1px solid var(--p-surface-border);
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--p-surface-card);
}
.suggestion-row.expanded { border-color: var(--p-primary-color); }
.suggestion-summary {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}
.suggestion-thumb {
  width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover;
}
.suggestion-name { font-weight: 500; }
.suggestion-details {
  padding: 0.5rem 0.75rem 0.75rem;
  border-top: 1px solid var(--p-surface-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.recipe-text { margin: 0; font-size: 0.875rem; line-height: 1.4; }
.ingredient-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.ingredient-amount { font-weight: 500; margin-right: 0.5rem; }
</style>
