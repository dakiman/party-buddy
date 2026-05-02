<script setup lang="ts">
import SelectButton from 'primevue/selectbutton'
import { useToast } from 'primevue/usetoast'
import { setMyAttendeeStatus } from '@/services/events'
import type { RsvpStatus } from '@/types'

const props = defineProps<{ eventId: number; status: RsvpStatus }>()
const emit = defineEmits<{ 'update:status': [value: RsvpStatus] }>()

const toast = useToast()

const options: { label: string; value: RsvpStatus }[] = [
  { label: 'Going', value: 'GOING' },
  { label: 'Maybe', value: 'MAYBE' },
  { label: 'Declined', value: 'DECLINED' },
]

async function onChange(next: RsvpStatus) {
  if (!next || next === props.status) return
  const previous = props.status
  emit('update:status', next)  // optimistic
  try {
    await setMyAttendeeStatus(props.eventId, next)
  } catch {
    emit('update:status', previous)  // rollback
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not update RSVP.', life: 3000 })
  }
}
</script>

<template>
  <div class="rsvp-toggle">
    <label>Your RSVP:</label>
    <SelectButton
      :model-value="status"
      :options="options"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      @update:model-value="onChange"
    />
  </div>
</template>

<style scoped>
.rsvp-toggle { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; }
.rsvp-toggle label { font-weight: 500; }
</style>
