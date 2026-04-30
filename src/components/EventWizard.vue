<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import Step from 'primevue/step'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import TimeAndPlaceStep from './steps/TimeAndPlaceStep.vue'
import MusicStep from './steps/MusicStep.vue'
import DrinksAndFoodStep from './steps/DrinksAndFoodStep.vue'
import ReviewStep from './steps/ReviewStep.vue'
import { useWizardStore } from '@/stores/wizard'
import { createEvent, updateEvent } from '@/services/events'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import type { CreateEventPayload, EventResponse, UpdateEventPayload } from '@/types'

const props = withDefaults(defineProps<{
  initialEvent?: EventResponse
}>(), {
  initialEvent: undefined,
})

const STEP_KEYS = ['timeAndPlace', 'music', 'drinksAndFood', 'review'] as const
type StepKey = typeof STEP_KEYS[number]

const STEP_LABEL: Record<StepKey, string> = {
  timeAndPlace: 'Time & Place',
  music: 'Music',
  drinksAndFood: 'Drinks & Food',
  review: 'Review',
}

const visible = ref(false)
const timeAndPlaceStep = ref()
const wizardStore = useWizardStore()
const toast = useToast()
const loading = ref(false)
const router = useRouter()

const isEditMode = computed(() => props.initialEvent !== undefined)

const activeSteps = computed<StepKey[]>(() => {
  const steps: StepKey[] = ['timeAndPlace']
  if (wizardStore.formData.enabledSteps.music) steps.push('music')
  if (wizardStore.formData.enabledSteps.drinksAndFood) steps.push('drinksAndFood')
  steps.push('review')
  return steps
})

function nextStep(current: StepKey): StepKey {
  const idx = activeSteps.value.indexOf(current)
  return activeSteps.value[Math.min(idx + 1, activeSteps.value.length - 1)]
}

function prevStep(current: StepKey): StepKey {
  const idx = activeSteps.value.indexOf(current)
  return activeSteps.value[Math.max(idx - 1, 0)]
}

function seedStoreFromEvent(event: EventResponse): void {
  wizardStore.updateFormData({
    name: event.name,
    date: event.date ? new Date(event.date) : null,
    time: event.time ? new Date(`1970-01-01T${event.time}`) : null,
    location: event.location
      ? { lat: event.location.latitude, lng: event.location.longitude }
      : null,
    locationDescription: event.location?.description ?? '',
    artists: event.artists,
    drinks: [],  // legacy field — always empty, same as create
    food: event.food ?? [],
    isPrivate: event.isPrivate,
    enabledSteps: {
      music: (event.artists?.length ?? 0) > 0,
      drinksAndFood: (event.food?.length ?? 0) > 0,
    },
  })
}

const show = () => {
  if (props.initialEvent) {
    seedStoreFromEvent(props.initialEvent)
  }
  visible.value = true
}

const close = () => {
  visible.value = false
  wizardStore.resetForm()
}

const handleFinish = async () => {
  try {
    loading.value = true

    if (isEditMode.value && props.initialEvent) {
      // ── Edit mode ─────────────────────────────────────────────────────
      const payload: UpdateEventPayload = {
        name: wizardStore.formData.name,
        isPrivate: wizardStore.formData.isPrivate,
        date: wizardStore.formData.date
          ? wizardStore.formData.date.toISOString().split('T')[0]
          : '',
        time: wizardStore.formData.time
          ? wizardStore.formData.time.toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
            })
          : undefined,
        location: wizardStore.formData.location
          ? {
              lat: wizardStore.formData.location.lat,
              lng: wizardStore.formData.location.lng,
              locationDescription: wizardStore.formData.locationDescription,
            }
          : undefined,
        artists: wizardStore.formData.enabledSteps.music
          ? wizardStore.formData.artists
          : [],
        drinks: [],
        ingredients: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.drinks.map(drink => Number(drink.id))
          : [],
        food: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.food
          : [],
      }
      await updateEvent(props.initialEvent.id, payload)
      toast.add({
        severity: 'success',
        summary: 'Event Updated!',
        detail: 'Your event has been updated successfully.',
        life: 3000,
      })
      close()
      router.push(`/events/${props.initialEvent.id}`)
    } else {
      // ── Create mode ───────────────────────────────────────────────────
      const payload: CreateEventPayload = {
        name: wizardStore.formData.name,
        isPrivate: wizardStore.formData.isPrivate,
        date: wizardStore.formData.date
          ? wizardStore.formData.date.toISOString().split('T')[0]
          : '',
        time: wizardStore.formData.time
          ? wizardStore.formData.time.toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
            })
          : undefined,
        location: wizardStore.formData.location
          ? {
              lat: wizardStore.formData.location.lat,
              lng: wizardStore.formData.location.lng,
              locationDescription: wizardStore.formData.locationDescription,
            }
          : undefined,
        artists: wizardStore.formData.enabledSteps.music
          ? wizardStore.formData.artists
          : [],
        drinks: [],
        ingredients: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.drinks.map(drink => Number(drink.id))
          : [],
        food: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.food
          : [],
      }
      await createEvent(payload)
      toast.add({
        severity: 'success',
        summary: 'Event Created!',
        detail: 'Your event has been created successfully.',
        life: 3000,
      })
      close()
      router.push('/')
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: isEditMode.value ? 'Update Failed' : 'Creation Failed',
      detail: 'Something went wrong. Please try again later.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

defineExpose({
  show,
})
</script>

<template>
  <Dialog v-model:visible="visible" modal :style="{ width: '90vw', maxWidth: '800px' }" :closable="true" @hide="close">
    <template #header>
      <h2 class="wizard-title">{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h2>
    </template>

    <Stepper value="timeAndPlace" linear id="stepper">
      <StepList>
        <Step v-for="key in activeSteps" :key="key" :value="key">
          {{ STEP_LABEL[key] }}
        </Step>
      </StepList>

      <StepPanels>
        <!-- Time & Place — always present -->
        <StepPanel v-slot="{ activateCallback }" value="timeAndPlace">
          <TimeAndPlaceStep ref="timeAndPlaceStep" />
          <div class="wizard-actions">
            <div></div>
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="() => {
              if (timeAndPlaceStep?.isValid) {
                activateCallback(nextStep('timeAndPlace'))
              } else {
                timeAndPlaceStep?.setTouched()
              }
            }" />
          </div>
        </StepPanel>

        <!-- Music — optional -->
        <StepPanel v-if="wizardStore.formData.enabledSteps.music" v-slot="{ activateCallback }" value="music">
          <MusicStep />
          <div class="wizard-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="() => activateCallback(prevStep('music'))" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="() => activateCallback(nextStep('music'))" />
          </div>
        </StepPanel>

        <!-- Drinks & Food — optional -->
        <StepPanel v-if="wizardStore.formData.enabledSteps.drinksAndFood" v-slot="{ activateCallback }" value="drinksAndFood">
          <DrinksAndFoodStep />
          <div class="wizard-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="() => activateCallback(prevStep('drinksAndFood'))" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="() => activateCallback(nextStep('drinksAndFood'))" />
          </div>
        </StepPanel>

        <!-- Review — always present -->
        <StepPanel v-slot="{ activateCallback }" value="review">
          <ReviewStep />
          <div class="wizard-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="() => activateCallback(prevStep('review'))" />
            <Button label="Finish" severity="success" icon="pi pi-check" :loading="loading" @click="handleFinish" />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Dialog>
</template>

<style>
.wizard-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}

.details-step,
.review-step {
  min-height: 300px;
}

.p-dialog {
  border-radius: 8px;
}

.p-dialog-header {
  padding: 1.5rem;
  background-color: transparent;
  border-bottom: 1px solid var(--surface-border);
  color: var(--text-color);
}

.p-dialog-content {
  padding: 15px;
  background-color: transparent;
  color: var(--text-color);
}

.review-step {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-section h4 {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--p-text-color);
  margin-bottom: 0.5rem;
}

.review-field {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.review-field label {
  font-weight: 500;
  color: var(--p-text-color);
  min-width: 120px;
}

.review-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--p-primary-color);
  color: var(--primary-color-text);
  border-radius: 1rem;
  font-size: 0.875rem;
}

.review-chip .chip-image {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  object-fit: cover;
}
</style>