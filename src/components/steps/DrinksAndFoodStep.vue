<script setup lang="ts">
import { ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Tag from 'primevue/tag'
import { useWizardStore } from '@/stores/wizard'
import api from '@/services/api'

interface DrinkOption {
    id: string
    name: string
    type: string
}

const wizardStore = useWizardStore()
const drinkSearchResults = ref<DrinkOption[]>([])
const selectedDrinks = ref<DrinkOption[]>([])
const foodSearchResults = ref<string[]>([])
const selectedFood = ref<string[]>([])
const loadingDrinks = ref(false)

// Static food/snacks list
const foodOptions = [
    'Chips', 'Popcorn', 'Pizza', 'Nachos', 'Pretzels',
    'Sandwiches', 'Cheese Platter', 'Fruit Platter',
    'Cookies', 'Brownies', 'Nuts', 'Candy'
]

const getIngredientImageUrl = (name: string) => {
    return `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(name)}-Small.png`
}

const searchDrinks = async (event: { query: string }) => {
    try {
        loadingDrinks.value = true
        const response = await api.get('/ingredients', {
            params: {
                isAlcoholic: true,
                name: event.query
            }
        })
        // Filter out already selected drinks
        const existingIds = selectedDrinks.value.map(drink => drink.id)
        drinkSearchResults.value = response.data.ingredients.filter(
            (drink: DrinkOption) => !existingIds.includes(drink.id)
        )
    } catch (error) {
        console.error('Error searching drinks:', error)
        drinkSearchResults.value = []
    } finally {
        loadingDrinks.value = false
    }
}

const searchFood = (event: { query: string }) => {
    const query = event.query.toLowerCase()
    // Filter out already selected food items
    const availableOptions = foodOptions.filter(
        food => !selectedFood.value.includes(food)
    )
    foodSearchResults.value = availableOptions.filter(food =>
        food.toLowerCase().includes(query)
    )
}

const removeDrink = (drink: DrinkOption) => {
    selectedDrinks.value = selectedDrinks.value.filter(d => d.id !== drink.id)
}

const removeFood = (food: string) => {
    selectedFood.value = selectedFood.value.filter(f => f !== food)
}

// Update store when selections change
watch([selectedDrinks, selectedFood], ([newDrinks, newFood]) => {
    wizardStore.updateFormData({
        drinks: newDrinks.map(drink => ({
            id: drink.id,
            name: drink.name
        })),
        food: newFood
    })
}, { deep: true })
</script>

<template>
    <div class="drinks-food-step">
        <h3 class="text-xl mb-4">Add drinks and snacks</h3>

        <div class="form-field">
            <label>Drinks</label>
            <AutoComplete v-model="selectedDrinks" :suggestions="drinkSearchResults" @complete="searchDrinks"
                :multiple="true" :delay="300" :loading="loadingDrinks" optionLabel="name"
                placeholder="Type to search drinks..." class="w-full">
                <template #option="slotProps">
                    <div class="item-option">
                        <div class="item-info">
                            <img :src="getIngredientImageUrl(slotProps.option.name)" class="item-image"
                                :alt="slotProps.option.name" />
                            <span class="item-name">{{ slotProps.option.name }}</span>
                        </div>
                        <div class="type-pills">
                            <Tag :value="slotProps.option.type">
                                {{ slotProps.option.type }}
                            </Tag>
                        </div>
                    </div>
                </template>

                <template #chip="slotProps">
                    <div class="item-chip">
                        <img :src="getIngredientImageUrl(slotProps.value.name)" class="chip-image"
                            :alt="slotProps.value.name" />
                        <span>{{ slotProps.value.name }}</span>
                        <i class="pi pi-times remove-icon" @click.stop="removeDrink(slotProps.value)" />
                    </div>
                </template>
            </AutoComplete>
        </div>

        <div class="form-field">
            <label>Food & Snacks</label>
            <AutoComplete
                v-model="selectedFood"
                :suggestions="foodSearchResults"
                @complete="searchFood"
                :multiple="true"
                :delay="300"
                placeholder="Type to search food..."
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
    padding: 0.125rem 0.5rem 0.125rem 0.125rem;
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
</style>