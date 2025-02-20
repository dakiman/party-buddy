<script setup lang="ts">
import { ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Tag from 'primevue/tag'
import { useWizardStore } from '@/stores/wizard'
import { searchArtists } from '@/services/music'
import type { Artist } from '@/stores/wizard'

const wizardStore = useWizardStore()
const searchResults = ref<Artist[]>([])
const selectedArtists = ref<Artist[]>([])
const loading = ref(false)

const search = async (event: { query: string }) => {
    try {
        loading.value = true
        const artists = await searchArtists(event.query)

        // Filter out already selected artists
        const existingIds = selectedArtists.value.map(artist => artist.id)
        searchResults.value = artists.filter(
            artist => !existingIds.includes(artist.id)
        )
    } catch (error) {
        console.error('Error searching artists:', error)
        searchResults.value = []
    } finally {
        loading.value = false
    }
}

const removeArtist = (artist: Artist) => {
    selectedArtists.value = selectedArtists.value.filter(a => a.id !== artist.id)
}

// Update store when selection changes
watch(selectedArtists, (newValue) => {
    wizardStore.updateFormData({ artists: newValue })
}, { deep: true })
</script>

<template>
    <div class="music-step">
        <h3 class="text-xl mb-4">Add some music</h3>
        <div class="form-field">
            <label>Search for artists</label>
            <AutoComplete v-model="selectedArtists" :suggestions="searchResults" @complete="search" :multiple="true"
                :delay="300" :loading="loading" optionLabel="name" placeholder="Type to search artists..."
                class="w-full">
                <template #option="slotProps">
                    <div class="artist-option">
                        <div class="artist-info">
                            <img :src="slotProps.option.images[2]?.url" class="artist-image"
                                :alt="slotProps.option.name" />
                            <span class="artist-name">{{ slotProps.option.name }}</span>
                        </div>
                        <div class="genre-pills">
                            <Tag v-for="genre in slotProps.option.genres.slice(0, 2)" :key="genre" :value="genre">
                                {{ genre }}
                            </Tag>
                        </div>
                    </div>
                </template>

                <template #chip="slotProps">
                    <div class="artist-chip">
                        <img :src="slotProps.value.images[2]?.url" class="chip-image" :alt="slotProps.value.name" />
                        <span>{{ slotProps.value.name }}</span>
                        <i class="pi pi-times remove-icon" @click.stop="removeArtist(slotProps.value)" />
                    </div>
                </template>
            </AutoComplete>
        </div>
    </div>
</template>

<style>
.music-step {
    min-height: 300px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-field label {
    font-weight: 500;
    color: var(--p-text-color);
}

.artist-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    width: 100%;
}

.artist-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.artist-image {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
}

.artist-name {
    font-size: 0.875rem;
    font-weight: 500;
}


.genre-pills {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
}

.genre-pills .p-tag {
    padding: 0.1rem 0.5rem;
    font-size: 0.60rem;
}

.artist-chip {
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
    background-color: var(--primary-color);
    border-radius: 4px;
    margin: 2px;
    padding: 0;
}

.p-autocomplete-token-icon {
    display: none;
}

.p-password input,
.p-inputtext {
    width: 100%;
    background-color: transparent;
    border: 1px solid var(--p-surface-border);
    color: var(--p-text-color);
    padding: 0.75rem;
}

.p-password i {
    color: var(--p-text-color);
}

.p-dialog-header {
    padding: 1.5rem;
    background-color: transparent;
    border-bottom: none;
    color: var(--p-text-color);
    font-family: 'Outfit', sans-serif;
}

.p-dialog-header-close {
    color: var(--p-text-color);
}

/* Add mobile-specific styles */
@media (max-width: 767px) {
    .artist-name {
        font-size: 0.75rem;
    }
    
    .artist-image {
        width: 2rem;
        height: 2rem;
    }
    
    .chip-image {
        width: 1rem;
        height: 1rem;
    }
}
</style>