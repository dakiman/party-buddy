<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import RequestDialog from './RequestDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { submitJoinRequest } from '@/services/events'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{ shareToken: string }>()
const emit = defineEmits<{ submitted: [] }>()

const authStore = useAuthStore()
const toast = useToast()
const dialogOpen = ref(false)
const submitting = ref(false)

async function onClick() {
  if (authStore.isAuthenticated) {
    submitting.value = true
    try {
      await submitJoinRequest(props.shareToken)
      emit('submitted')
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Could not submit your request.', life: 3000 })
    } finally {
      submitting.value = false
    }
  } else {
    dialogOpen.value = true
  }
}
</script>

<template>
  <div class="request-panel">
    <p>This is a private event. Request to join, and the host will let you in.</p>
    <Button
      :label="authStore.isAuthenticated ? `Request to join as @${authStore.user?.username}` : 'Request to join'"
      :loading="submitting"
      @click="onClick"
    />
    <RequestDialog
      v-if="!authStore.isAuthenticated"
      v-model:visible="dialogOpen"
      :share-token="shareToken"
      mode="request"
      @submitted="emit('submitted')"
    />
  </div>
</template>

<style scoped>
.request-panel {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}
.request-panel p { color: var(--p-text-secondary-color); margin: 0 0 1rem 0; }
</style>
