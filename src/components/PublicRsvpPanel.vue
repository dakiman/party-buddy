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
      toast.add({ severity: 'error', summary: 'Error', detail: 'Could not RSVP.', life: 3000 })
    } finally {
      submitting.value = false
    }
  } else {
    dialogOpen.value = true
  }
}
</script>

<template>
  <div class="rsvp-panel">
    <Button
      :label="authStore.isAuthenticated ? `I'm going as @${authStore.user?.username}` : `I'm going`"
      icon="pi pi-check"
      :loading="submitting"
      @click="onClick"
    />
    <RequestDialog
      v-if="!authStore.isAuthenticated"
      v-model:visible="dialogOpen"
      :share-token="shareToken"
      mode="rsvp"
      @submitted="emit('submitted')"
    />
  </div>
</template>

<style scoped>
.rsvp-panel { text-align: center; padding: 1rem 0; }
</style>
