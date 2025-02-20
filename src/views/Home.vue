<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const events = ref([])
const loading = ref(true)
const error = ref(false)

const emit = defineEmits(['showLogin', 'showRegister'])

async function fetchEvents() {
  loading.value = true
  error.value = false
  
  try {
    const response = await api.get('/events', { params: { createdBy: 'me' } })
    events.value = response.data
  } catch (err) {
    console.error('Failed to fetch events:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Watch for authentication state changes
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
    <div v-if="!authStore.isAuthenticated" class="unauthenticated">
      <h1>Welcome to Event Planner</h1>
      <p>Join us to get started with organizing your events.</p>
      <div class="auth-buttons">
        <Button label="Join us" severity="primary" @click="openRegisterModal" />
        <Button label="Login" severity="secondary" @click="openLoginModal" />
      </div>
    </div>

    <template v-else>
      <div class="header">
        <h1>My Events</h1>
        <Button label="Create a new event" @click="navigateToCreate" />
      </div>

      <div v-if="loading" class="loading">
        <ProgressSpinner />
        <p>Loading events...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>Something went wrong trying to retrieve your events</p>
        <Button label="Try again" @click="router.go(0)" severity="secondary" />
      </div>

      <div v-else-if="events.length === 0" class="no-events">
        <p>You haven't created any events yet.</p>
        <Button label="Create your first event" @click="navigateToCreate" />
      </div>

      <div v-else class="events-grid">
        <div v-for="event in events" :key="event.id" class="event-card" @click="router.push(`/events/${event.id}`)">
          <h3>{{ event.name }}</h3>
          <p>{{ new Date(event.date).toLocaleDateString() }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
.home {
  padding: 2rem;
}

.unauthenticated {
  text-align: center;
  padding: 4rem 1rem;
}

.unauthenticated h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin-bottom: 1rem;
}

.unauthenticated p {
  color: var(--p-text-secondary-color);
  margin-bottom: 2rem;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0;
}

.header button {
  background: var(--p-indigo-400);
  color: #fff;
}

.header button:hover {
  background: var(--p-indigo-500);
}

.loading,
.no-events,
.error {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.event-card {
  background: var(--p-gray-800);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--p-indigo-400);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card h3 {
  margin: 0 0 0.5rem 0;
  color: #fff;
}

.event-card p {
  margin: 0;
  color: var(--p-indigo-400);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
