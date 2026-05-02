<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { submitJoinRequest } from '@/services/events'

interface Props {
  visible: boolean
  shareToken: string
  /** Header copy and submit-button label vary by mode. */
  mode: 'request' | 'rsvp'
  /** Optional pre-fill for returning guests on public-event RSVP claim. */
  initialDisplayName?: string
  /** Lock the display-name field so a returning guest can't rename. */
  displayNameLocked?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submitted: []
}>()

const toast = useToast()
const displayName = ref(props.initialDisplayName ?? '')
const contactNote = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

watch(() => props.visible, open => {
  if (open) {
    displayName.value = props.initialDisplayName ?? ''
    contactNote.value = ''
    error.value = null
  }
})

const headerLabel = () => props.mode === 'request' ? 'Request to join' : "I'm going"
const submitLabel = () => props.mode === 'request' ? 'Send request' : 'Confirm'

async function onSubmit() {
  if (!displayName.value.trim()) {
    error.value = 'Display name is required.'
    return
  }
  submitting.value = true
  error.value = null
  try {
    await submitJoinRequest(props.shareToken, {
      displayName: displayName.value.trim(),
      contactNote: contactNote.value.trim() || undefined,
    })
    emit('submitted')
    emit('update:visible', false)
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number; data?: { message?: string } } })?.response?.status
    const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    if (status === 503) {
      error.value = message ?? 'Name unavailable, try a different name.'
    } else if (status === 400) {
      error.value = message ?? 'Display name is required.'
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Could not submit your request.', life: 3000 })
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :header="headerLabel()"
    :style="{ width: '26rem' }"
  >
    <div class="request-dialog">
      <div class="field">
        <label for="rd-name">Your name <span class="req">*</span></label>
        <InputText
          id="rd-name"
          v-model="displayName"
          :disabled="displayNameLocked"
          maxlength="64"
          placeholder="e.g. Alice"
          fluid
        />
        <small>We'll add a tag like <code>#1234</code> to make you unique.</small>
      </div>

      <div class="field">
        <label for="rd-note">Note for the host (optional)</label>
        <Textarea
          id="rd-note"
          v-model="contactNote"
          maxlength="255"
          rows="3"
          placeholder="Anything that helps the host recognize you — note, email, phone…"
          fluid
        />
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="actions">
        <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
        <Button :label="submitLabel()" :loading="submitting" @click="onSubmit" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.request-dialog { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label { font-size: 0.9rem; color: var(--p-text-color); }
.field small { color: var(--p-text-secondary-color); font-size: 0.8rem; }
.field .req { color: var(--p-red-400); }
.error { color: var(--p-red-400); font-size: 0.875rem; }
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
</style>
