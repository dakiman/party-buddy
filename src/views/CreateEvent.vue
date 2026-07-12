<script setup lang="ts">
import EventTypeSelector from '@/components/EventTypeSelector.vue'
</script>

<template>
  <div class="create-event">
    <h1 class="title">Create a New Event</h1>
    <p class="subtitle">What type of event would you like to create?</p>
    <EventTypeSelector />
  </div>
</template>

<style scoped>
.create-event {
  text-align: center;
  padding: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--p-text-color);
}

.subtitle {
  font-size: 1.1rem;
  color: var(--p-text-muted-color);
  margin-bottom: 2rem;
}
</style> 