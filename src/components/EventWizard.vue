<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, provide, readonly } from 'vue'
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
import { formatLocalDate, formatLocalTime } from '@/utils/datetime'
import { createEvent, updateEvent } from '@/services/events'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { getApiErrorMessage } from '@/utils/errors'
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

const emit = defineEmits<{
  cancel: []
}>()

const timeAndPlaceStep = ref()
const wizardStore = useWizardStore()
const toast = useToast()
const loading = ref(false)
const router = useRouter()
const currentStep = ref<StepKey>('timeAndPlace')
provide('currentWizardStep', readonly(currentStep))

watch(currentStep, () => {
  window.scrollTo({ top: 0 })
})

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
    ingredients: (event.ingredients ?? []).map(i => ({
      id: i.id,
      name: i.name,
    })),
    cocktails: event.drinks ?? [],
    food: event.food ?? [],
    isPrivate: event.isPrivate,
    enabledSteps: {
      music: (event.artists?.length ?? 0) > 0,
      drinksAndFood:
        (event.food?.length ?? 0) > 0 ||
        (event.ingredients?.length ?? 0) > 0 ||
        (event.drinks?.length ?? 0) > 0,
    },
  })
}

onMounted(() => {
  if (props.initialEvent) {
    seedStoreFromEvent(props.initialEvent)
  }
})

// Page-mode lifecycle: leaving the route (finish, cancel, back button)
// unmounts the wizard — reset the in-progress form there.
onUnmounted(() => {
  wizardStore.resetForm()
})

const handleFinish = async () => {
  try {
    loading.value = true

    if (isEditMode.value && props.initialEvent) {
      // ── Edit mode ─────────────────────────────────────────────────────
      const payload: UpdateEventPayload = {
        name: wizardStore.formData.name,
        isPrivate: wizardStore.formData.isPrivate,
        date: wizardStore.formData.date
          ? formatLocalDate(wizardStore.formData.date)
          : '',
        time: wizardStore.formData.time
          ? formatLocalTime(wizardStore.formData.time)
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
        drinks: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.cocktails.map(c => c.id)
          : [],
        ingredients: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.ingredients.map(i => i.id)
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
      router.push(`/events/${props.initialEvent.id}`)
    } else {
      // ── Create mode ───────────────────────────────────────────────────
      const payload: CreateEventPayload = {
        name: wizardStore.formData.name,
        isPrivate: wizardStore.formData.isPrivate,
        date: wizardStore.formData.date
          ? formatLocalDate(wizardStore.formData.date)
          : '',
        time: wizardStore.formData.time
          ? formatLocalTime(wizardStore.formData.time)
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
        drinks: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.cocktails.map(c => c.id)
          : [],
        ingredients: wizardStore.formData.enabledSteps.drinksAndFood
          ? wizardStore.formData.ingredients.map(i => i.id)
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
      router.push('/')
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: isEditMode.value ? 'Update Failed' : 'Creation Failed',
      detail: getApiErrorMessage(e, 'Something went wrong. Please try again later.'),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="wizard-page">
    <div class="wizard-header">
      <h1 class="wizard-title">{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h1>
      <Button label="Cancel" severity="secondary" text @click="emit('cancel')" />
    </div>

    <Stepper v-model:value="currentStep" linear id="stepper" class="wizard-card">
      <StepList>
        <Step
          v-for="(key, idx) in activeSteps"
          :key="key"
          :value="key"
          :pt="{
            number: () => ({
              innerHTML:
                activeSteps.indexOf(key) < activeSteps.indexOf(currentStep)
                  ? '<i class=\'pi pi-check\'></i>'
                  : String(idx + 1),
            }),
          }"
        >
          {{ STEP_LABEL[key] }}
        </Step>
      </StepList>

      <StepPanels>
        <!-- Time & Place — always present -->
        <StepPanel v-slot="{ activateCallback }" value="timeAndPlace">
          <TimeAndPlaceStep ref="timeAndPlaceStep" />
          <div class="wizard-actions">
            <div></div>
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" :aria-label="`Next: ${STEP_LABEL[nextStep('timeAndPlace')]}`" @click="() => {
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
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" :aria-label="`Next: ${STEP_LABEL[nextStep('music')]}`" @click="() => activateCallback(nextStep('music'))" />
          </div>
        </StepPanel>

        <!-- Drinks & Food — optional -->
        <StepPanel v-if="wizardStore.formData.enabledSteps.drinksAndFood" v-slot="{ activateCallback }" value="drinksAndFood">
          <DrinksAndFoodStep />
          <div class="wizard-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="() => activateCallback(prevStep('drinksAndFood'))" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" :aria-label="`Next: ${STEP_LABEL[nextStep('drinksAndFood')]}`" @click="() => activateCallback(nextStep('drinksAndFood'))" />
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
  </div>
</template>

<style scoped>
.wizard-page {
  max-width: 800px;
  margin: 0 auto;
}

.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.wizard-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
}

.wizard-card {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--pb-radius-card);
  padding: 1.5rem;
}

.wizard-card :deep(.p-steppanels) {
  background: transparent;
  padding: 1.5rem 0 0;
}

.wizard-card :deep(.p-steplist) {
  background: transparent;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--p-content-border-color);
}

.wizard-card :deep(.p-steppanel) {
  background: transparent;
}

/* Mobile: numbers only for inactive steps — no truncated labels */
@media screen and (max-width: 640px) {
  .wizard-card :deep(.p-step:not(.p-step-active) .p-step-title) {
    display: none;
  }
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-content-border-color);
}
</style>
