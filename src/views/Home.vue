<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import api from '@/services/api'

const router = useRouter()
const events = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/events', {params: {createdBy: 'me'}})
    events.value = response.data
  } catch (error) {
    console.error('Failed to fetch events:', error)
  } finally {
    loading.value = false
  }
})

const navigateToCreate = () => {
  router.push('/create')
}
</script>

<template>
  <div class="home">
    <div class="header">
      <h1>My Events</h1>
      <Button label="Create a new event" @click="navigateToCreate" />
    </div>

    <div v-if="loading" class="loading">
      Loading events...
    </div>
    
    <div v-else-if="events.length === 0" class="no-events">
      <p>You haven't created any events yet.</p>
      <Button label="Create your first event" @click="navigateToCreate" />
    </div>
    
    <div v-else class="events-grid">
      <!-- We can expand this later with proper event cards -->
      <div v-for="event in events" :key="event.id" class="event-card">
        <h3>{{ event.name }}</h3>
        <p>{{ event.date }}</p>
      </div>
    </div>
  </div>
</template>

<style>
.home {
  padding: 2rem;
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
  color: var(--text-color);
  margin: 0;
}

.loading, .no-events {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary-color);
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.event-card {
  background: var(--surface-card);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--surface-border);
}

.event-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.event-card p {
  margin: 0;
  color: var(--text-secondary-color);
}
</style>
