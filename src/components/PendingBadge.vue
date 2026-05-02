<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Badge from 'primevue/badge'
import { pendingRequestCountForMyEvents } from '@/services/events'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const count = ref(0)

async function refresh() {
  if (!authStore.isAuthenticated) {
    count.value = 0
    return
  }
  try {
    count.value = await pendingRequestCountForMyEvents()
  } catch {
    count.value = 0
  }
}

onMounted(refresh)
watch(() => route.path, refresh)
watch(() => authStore.isAuthenticated, refresh)
</script>

<template>
  <Badge v-if="count > 0" :value="count" severity="warn" />
</template>
