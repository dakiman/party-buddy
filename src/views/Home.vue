<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { listMyEvents } from '@/services/events'
import { formatLocalDate } from '@/utils/datetime'
import { useAuthStore } from '@/stores/auth'
import EventCard from '@/components/EventCard.vue'
import type { EventResponse } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const events = ref<EventResponse[]>([])
const loading = ref(true)
const error = ref(false)
const showPast = ref(false)

const emit = defineEmits(['showLogin', 'showRegister'])

// Undated events sort as upcoming, at the end.
const upcomingEvents = computed(() => {
  const today = formatLocalDate(new Date())
  return events.value
    .filter(e => !e.date || e.date >= today)
    .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
})

const pastEvents = computed(() => {
  const today = formatLocalDate(new Date())
  return events.value
    .filter(e => e.date && e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))
})

async function fetchEvents() {
  loading.value = true
  error.value = false

  try {
    events.value = await listMyEvents()
  } catch (err) {
    console.error('Failed to fetch events:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    fetchEvents()
  } else {
    events.value = []
    error.value = false
  }
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    loading.value = false
    return
  }

  await fetchEvents()
})

const navigateToCreate = () => {
  router.push('/create')
}

const openRegisterModal = () => {
  emit('showRegister')
}

const openLoginModal = () => {
  emit('showLogin')
}
</script>

<template>
  <div class="home">
    <div v-if="!authStore.isAuthenticated" class="welcome">
      <h1 class="welcome-title">
        Plan the party.<br />
        <span class="pb-gradient-text">We've got the rest.</span>
      </h1>
      <p class="welcome-sub">
        Pick a night, line up the music, stock the bar with cocktail ideas,
        and collect RSVPs — all in one place.
      </p>
      <div class="auth-buttons">
        <Button label="Join us" class="cta-button" @click="openRegisterModal" />
        <Button label="Login" severity="secondary" text @click="openLoginModal" />
      </div>
      <router-link to="/discover" class="browse-link">
        Or browse public events <i class="pi pi-arrow-right" />
      </router-link>
    </div>

    <template v-else>
      <div class="header">
        <h1>My Events</h1>
        <Button label="Create a new event" icon="pi pi-plus" class="cta-button" @click="navigateToCreate" />
      </div>

      <div v-if="loading" class="state">
        <ProgressSpinner />
        <p>Loading events...</p>
      </div>

      <div v-else-if="error" class="state">
        <div class="state-icon"><i class="pi pi-exclamation-circle" /></div>
        <h2>Something went wrong</h2>
        <p>We couldn't load your events.</p>
        <Button label="Try again" @click="router.go(0)" severity="secondary" />
      </div>

      <div v-else-if="events.length === 0" class="state">
        <div class="state-icon"><i class="pi pi-sparkles" /></div>
        <h2>No parties yet</h2>
        <p>Your next great night starts here.</p>
        <Button label="Create your first event" class="cta-button" @click="navigateToCreate" />
      </div>

      <template v-else>
        <section v-if="upcomingEvents.length">
          <h2 class="pb-section-label group-label">Upcoming</h2>
          <div class="events-grid">
            <EventCard v-for="event in upcomingEvents" :key="event.id" :event="event" hide-host />
          </div>
        </section>

        <section v-if="pastEvents.length" class="past-section">
          <button class="past-toggle" @click="showPast = !showPast">
            {{ showPast ? 'Hide past events' : `Show ${pastEvents.length} past event${pastEvents.length === 1 ? '' : 's'}` }}
            <i :class="showPast ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
          </button>
          <template v-if="showPast">
            <h2 class="pb-section-label group-label">Past</h2>
            <div class="events-grid past-grid">
              <EventCard v-for="event in pastEvents" :key="event.id" :event="event" hide-host />
            </div>
          </template>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.home {
  padding: 1rem;
}

/* ── Welcome hero (logged out) ── */
.welcome {
  text-align: center;
  padding: 5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-title {
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--p-text-color);
  margin: 0 0 1.25rem;
}

.welcome-sub {
  color: var(--p-text-muted-color);
  font-size: 1.1rem;
  max-width: 34rem;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.browse-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.browse-link:hover {
  text-decoration: underline;
}

/* ── Authed list ── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--p-text-color);
  margin: 0;
}

.cta-button {
  box-shadow: var(--pb-glow);
}

.state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--p-text-muted-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.state h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.state p {
  margin: 0 0 0.75rem;
}

.state-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--p-content-border-color);
  background: var(--p-surface-900);
  box-shadow: var(--pb-glow-soft);
  margin-bottom: 0.5rem;
}

.state-icon i {
  font-size: 1.5rem;
  color: var(--p-primary-color);
}

.group-label {
  margin: 0 0 0.9rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.25rem;
}

.past-section {
  margin-top: 2rem;
}

.past-toggle {
  background: none;
  border: none;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0;
  margin-bottom: 1rem;
}

.past-toggle:hover {
  color: var(--p-text-color);
}

.past-grid {
  opacity: 0.6;
}
</style>
