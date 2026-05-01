<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useWizardStore } from '@/stores/wizard'
import { searchArtists, getArtistTopTracks, getSimilarArtists } from '@/services/music'
import type { Artist, Track } from '@/types'

const wizardStore = useWizardStore()
const searchResults = ref<Artist[]>([])
const selectedArtists = ref<Artist[]>([...wizardStore.formData.artists])
const loading = ref(false)
const searchQuery = ref('')
const autoCompleteRef = ref<InstanceType<typeof AutoComplete> | null>(null)

const expandedArtistId = ref<string | null>(null)
const topTracksByArtist = ref<Record<string, Track[]>>({})
const topTracksLoading = ref<Record<string, boolean>>({})
const currentTrackId = ref<string | null>(null)

const similarArtists = ref<Artist[]>([])
const similarLoading = ref(false)
const similarErrored = ref(false)
const hasSearchedSimilar = ref(false)

const currentWizardStep = inject<Ref<string>>('currentWizardStep')

const search = async (event: { query: string }) => {
    try {
        loading.value = true
        const artists = await searchArtists(event.query)
        const existingIds = selectedArtists.value.map(a => a.id)
        searchResults.value = artists.filter(a => !existingIds.includes(a.id))
    } catch (error) {
        console.error('Error searching artists:', error)
        searchResults.value = []
    } finally {
        loading.value = false
    }
}

const onArtistSelect = async (event: { value: Artist }) => {
    if (selectedArtists.value.some(a => a.id === event.value.id)) return
    selectedArtists.value = [...selectedArtists.value, event.value]
    searchQuery.value = ''
    searchResults.value = []
    await nextTick()
    // PrimeVue AutoComplete exposes the inner input via its root element; query it directly.
    const root = (autoCompleteRef.value as unknown as { $el?: HTMLElement } | null)?.$el
    const input = root?.querySelector<HTMLInputElement>('input')
    input?.focus()
}

const removeArtist = (artist: Artist) => {
    selectedArtists.value = selectedArtists.value.filter(a => a.id !== artist.id)
    if (expandedArtistId.value === artist.id) {
        expandedArtistId.value = null
        currentTrackId.value = null
    }
}

const toggleArtistExpansion = async (artist: Artist) => {
    if (expandedArtistId.value === artist.id) {
        expandedArtistId.value = null
        currentTrackId.value = null
        return
    }
    expandedArtistId.value = artist.id
    currentTrackId.value = null
    if (!topTracksByArtist.value[artist.id]) {
        topTracksLoading.value[artist.id] = true
        try {
            topTracksByArtist.value[artist.id] = await getArtistTopTracks(artist.id)
        } catch (error) {
            console.error('Error loading top tracks:', error)
            topTracksByArtist.value[artist.id] = []
        } finally {
            topTracksLoading.value[artist.id] = false
        }
    }
}

const onRowKeydown = (event: KeyboardEvent, artist: Artist) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggleArtistExpansion(artist)
    }
}

const playTrack = (track: Track) => {
    currentTrackId.value = track.id
}

const formatDuration = (ms: number | null): string => {
    if (!ms) return ''
    const totalSec = Math.round(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

const expandedArtist = computed<Artist | null>(() =>
    selectedArtists.value.find(a => a.id === expandedArtistId.value) ?? null
)

const expandedTracks = computed<Track[]>(() =>
    expandedArtistId.value ? (topTracksByArtist.value[expandedArtistId.value] ?? []) : []
)

const expandedLoading = computed<boolean>(() =>
    expandedArtistId.value ? !!topTracksLoading.value[expandedArtistId.value] : false
)

const findSimilar = async () => {
    if (selectedArtists.value.length === 0) return
    similarLoading.value = true
    similarErrored.value = false
    hasSearchedSimilar.value = true
    try {
        const seedNames = selectedArtists.value.map(a => a.name)
        const selectedIds = new Set(selectedArtists.value.map(a => a.id))
        const results = await getSimilarArtists(seedNames)
        similarArtists.value = results.filter(a => !selectedIds.has(a.id))
    } catch (error) {
        console.error('Error fetching similar artists:', error)
        similarErrored.value = true
        similarArtists.value = []
    } finally {
        similarLoading.value = false
    }
}

const addSimilar = (artist: Artist) => {
    if (selectedArtists.value.some(a => a.id === artist.id)) return
    selectedArtists.value = [...selectedArtists.value, artist]
    similarArtists.value = similarArtists.value.filter(a => a.id !== artist.id)
}

watch(selectedArtists, (newValue) => {
    wizardStore.updateFormData({ artists: newValue })
}, { deep: true })

if (currentWizardStep) {
    watch(currentWizardStep, (step) => {
        if (step !== 'music') currentTrackId.value = null
    })
}

onMounted(() => {
    selectedArtists.value = [...wizardStore.formData.artists]
})

onBeforeUnmount(() => {
    currentTrackId.value = null
})
</script>

<template>
    <div class="music-step">
        <h3 class="text-xl mb-4">Add some music</h3>
        <div class="form-field">
            <label>Search for artists</label>
            <AutoComplete
                ref="autoCompleteRef"
                v-model="searchQuery"
                :suggestions="searchResults"
                @complete="search"
                @item-select="onArtistSelect"
                :delay="300"
                :loading="loading"
                optionLabel="name"
                placeholder="Type to search artists..."
                appendTo="body"
                class="w-full">
                <template #option="slotProps">
                    <div class="artist-option">
                        <div class="artist-info">
                            <img :src="slotProps.option.images[2]?.url ?? slotProps.option.images[0]?.url"
                                class="artist-image" :alt="slotProps.option.name" />
                            <span class="artist-name">{{ slotProps.option.name }}</span>
                        </div>
                        <div class="genre-pills">
                            <Tag v-for="genre in slotProps.option.genres.slice(0, 2)" :key="genre" :value="genre">
                                {{ genre }}
                            </Tag>
                        </div>
                    </div>
                </template>
            </AutoComplete>
        </div>

        <ul v-if="selectedArtists.length > 0" class="artist-list">
            <li v-for="artist in selectedArtists" :key="artist.id" class="artist-row-wrapper">
                <div
                    class="artist-row"
                    :class="{ 'artist-row-expanded': expandedArtistId === artist.id }"
                    role="button"
                    tabindex="0"
                    :aria-expanded="expandedArtistId === artist.id"
                    @click="toggleArtistExpansion(artist)"
                    @keydown.enter.prevent="onRowKeydown($event, artist)"
                    @keydown.space.prevent="onRowKeydown($event, artist)">
                    <img
                        v-if="artist.images[2]?.url ?? artist.images[0]?.url"
                        :src="artist.images[2]?.url ?? artist.images[0]?.url"
                        class="artist-row-image" :alt="artist.name" />
                    <div v-else class="artist-row-image artist-row-image-placeholder"><i class="pi pi-user" /></div>
                    <div class="artist-row-meta">
                        <span class="artist-row-name">{{ artist.name }}</span>
                        <div v-if="artist.genres && artist.genres.length > 0" class="artist-row-genres">
                            <Tag v-for="genre in artist.genres.slice(0, 2)" :key="genre" :value="genre" />
                        </div>
                    </div>
                    <i class="pi pi-chevron-down artist-row-chevron" aria-hidden="true" />
                    <button
                        type="button"
                        class="artist-row-remove"
                        :aria-label="`Remove ${artist.name}`"
                        @click.stop="removeArtist(artist)">
                        <i class="pi pi-times" aria-hidden="true" />
                    </button>
                </div>
            </li>
        </ul>

        <div v-if="expandedArtist" class="tracks-panel">
            <div class="tracks-header">
                <span>Top tracks — {{ expandedArtist.name }}</span>
                <button type="button" class="close-tracks" @click="expandedArtistId = null; currentTrackId = null">
                    <i class="pi pi-times" />
                </button>
            </div>

            <div v-if="expandedLoading" class="tracks-loading">
                <Skeleton v-for="i in 4" :key="i" height="2.5rem" class="track-skeleton" />
            </div>
            <div v-else-if="expandedTracks.length === 0" class="tracks-empty">
                No tracks available for this artist.
            </div>
            <ul v-else class="track-list">
                <li v-for="track in expandedTracks.slice(0, 5)" :key="track.id"
                    class="track-row" :class="{ 'track-row-active': currentTrackId === track.id }">
                    <img v-if="track.albumImageUrl" :src="track.albumImageUrl" class="track-cover" :alt="track.name" />
                    <div v-else class="track-cover track-cover-placeholder"><i class="pi pi-image" /></div>
                    <div class="track-meta">
                        <span class="track-name">{{ track.name }}</span>
                        <span class="track-duration">{{ formatDuration(track.durationMs) }}</span>
                    </div>
                    <Button :icon="currentTrackId === track.id ? 'pi pi-volume-up' : 'pi pi-play'"
                        :severity="currentTrackId === track.id ? 'success' : 'secondary'"
                        text rounded :aria-label="`Play ${track.name}`" @click="playTrack(track)" />
                </li>
            </ul>

            <iframe v-if="currentTrackId"
                class="spotify-embed"
                :src="`https://open.spotify.com/embed/track/${currentTrackId}?theme=0`"
                width="100%" height="80" frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy" />
        </div>

        <div v-if="selectedArtists.length > 0" class="similar-section">
            <div class="similar-actions">
                <Button :label="hasSearchedSimilar ? 'Refresh suggestions' : 'Find similar artists'"
                    icon="pi pi-sparkles" severity="secondary" :loading="similarLoading" @click="findSimilar" />
            </div>

            <div v-if="similarLoading" class="similar-grid">
                <div v-for="i in 4" :key="i" class="similar-card-skeleton">
                    <Skeleton shape="circle" size="2.5rem" />
                    <Skeleton width="6rem" height="0.875rem" />
                </div>
            </div>
            <div v-else-if="similarErrored" class="similar-empty">
                Couldn't fetch suggestions right now. Try again in a bit.
            </div>
            <div v-else-if="hasSearchedSimilar && similarArtists.length === 0" class="similar-empty">
                No suggestions available for this set of artists.
            </div>
            <div v-else-if="similarArtists.length > 0" class="similar-grid">
                <button v-for="artist in similarArtists" :key="artist.id" type="button"
                    class="similar-card" @click="addSimilar(artist)">
                    <img v-if="artist.images && artist.images[2]?.url"
                        :src="artist.images[2].url" class="similar-image" :alt="artist.name" />
                    <div v-else class="similar-image similar-image-placeholder"><i class="pi pi-user" /></div>
                    <span class="similar-name">{{ artist.name }}</span>
                    <Tag v-if="artist.genres && artist.genres[0]" :value="artist.genres[0]" />
                </button>
            </div>
        </div>
    </div>
</template>

<style>
.music-step {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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
    cursor: pointer;
    transition: filter 0.15s;
}

.artist-chip:hover {
    filter: brightness(1.1);
}

.artist-chip-active {
    outline: 2px solid var(--p-primary-color);
    outline-offset: 2px;
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

/* Selected-artist accordion list */
.artist-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.artist-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    background: transparent;
    color: var(--p-text-color);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, border-color 0.15s;
    user-select: none;
}

.artist-row:hover,
.artist-row:focus-visible {
    background: var(--p-surface-hover);
    border-color: var(--p-primary-color);
    outline: none;
}

.artist-row-expanded {
    border-color: var(--p-primary-color);
}

.artist-row-image {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.artist-row-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--p-surface-border);
    color: var(--p-text-muted-color, #888);
}

.artist-row-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
}

.artist-row-name {
    font-size: 0.95rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.artist-row-genres {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.artist-row-genres .p-tag {
    padding: 0.1rem 0.5rem;
    font-size: 0.6rem;
}

.artist-row-chevron {
    font-size: 0.875rem;
    color: var(--p-text-muted-color, #888);
    transition: transform 0.2s ease;
    flex-shrink: 0;
}

.artist-row-expanded .artist-row-chevron {
    transform: rotate(180deg);
}

.artist-row-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--p-text-muted-color, #888);
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, background 0.15s;
    flex-shrink: 0;
}

.artist-row-remove:hover,
.artist-row-remove:focus-visible {
    opacity: 1;
    background: var(--p-surface-hover);
    outline: none;
}

.artist-row-expansion {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    background: var(--p-surface-card, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.artist-row-expansion-header {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--p-text-color);
}

@media (max-width: 767px) {
    .artist-row-image { width: 2.5rem; height: 2.5rem; }
    .artist-row-name { font-size: 0.875rem; }
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

/* Tracks panel */
.tracks-panel {
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    padding: 0.75rem;
    background: var(--p-surface-card, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tracks-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--p-text-color);
}

.close-tracks {
    background: transparent;
    border: none;
    color: var(--p-text-color);
    cursor: pointer;
    opacity: 0.6;
    padding: 0.25rem;
}

.close-tracks:hover { opacity: 1; }

.tracks-loading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.track-skeleton { border-radius: 6px; }

.tracks-empty {
    padding: 0.75rem;
    text-align: center;
    color: var(--p-text-muted-color, #888);
    font-size: 0.875rem;
}

.track-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.track-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4rem 0.5rem;
    border-radius: 6px;
    transition: background 0.15s;
}

.track-row:hover { background: var(--p-surface-hover); }

.track-row-active { background: var(--p-surface-hover); }

.track-cover {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
}

.track-cover-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--p-surface-border);
    color: var(--p-text-muted-color, #888);
}

.track-meta {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.track-name {
    font-size: 0.875rem;
    color: var(--p-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.track-duration {
    font-size: 0.75rem;
    color: var(--p-text-muted-color, #888);
}

.spotify-embed {
    border-radius: 8px;
    margin-top: 0.5rem;
    border: none;
}

/* Similar artists section */
.similar-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.similar-actions {
    display: flex;
    justify-content: flex-start;
}

.similar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: 0.75rem;
}

.similar-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 0.5rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    background: transparent;
    color: var(--p-text-color);
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s, background 0.15s;
}

.similar-card:hover {
    border-color: var(--p-primary-color);
    background: var(--p-surface-hover);
}

.similar-image {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    object-fit: cover;
}

.similar-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--p-surface-border);
    color: var(--p-text-muted-color, #888);
}

.similar-name {
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
}

.similar-card-skeleton {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 0.5rem;
}

.similar-empty {
    padding: 1rem;
    text-align: center;
    color: var(--p-text-muted-color, #888);
    font-size: 0.875rem;
    border: 1px dashed var(--p-surface-border);
    border-radius: 8px;
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

    .similar-grid {
        grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    }
}
</style>
