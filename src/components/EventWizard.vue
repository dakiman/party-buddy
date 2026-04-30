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
import { createEvent } from '@/services/events'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import type { CreateEventPayload } from '@/types'

const visible = ref(false)
const timeAndPlaceStep = ref()
const wizardStore = useWizardStore()
const toast = useToast()
const loading = ref(false)
const router = useRouter()

// Generate step values based on enabled steps
const getStepValue = (baseValue: number) => {
  let adjustedValue = baseValue

  if (!wizardStore.formData.enabledSteps.music && baseValue > 1) {
    adjustedValue--
  }

  if (!wizardStore.formData.enabledSteps.drinksAndFood) {
    const musicStep = wizardStore.formData.enabledSteps.music ? 2 : 1
    if (baseValue > musicStep) {
      adjustedValue--
    }
  }

  return String(adjustedValue)
}

const getNextStep = (currentStep: string) => {
  const current = parseInt(currentStep)

  if (current === 1) {
    if (wizardStore.formData.enabledSteps.music) {
      return '2'
    } else if (wizardStore.formData.enabledSteps.drinksAndFood) {
      return '2'
    } else {
      return '2'
    }
  } else if (current === 2) {
    if (wizardStore.formData.enabledSteps.music && wizardStore.formData.enabledSteps.drinksAndFood) {
      return '3'
    } else {
      return '3'
    }
  } else {
    return '4'
  }
}

const show = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
  wizardStore.resetForm()
}

const handleFinish = async () => {
  try {
    loading.value = true

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
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Creation Failed',
      detail: 'Unable to create Event currently. Please try again later.',
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
      <h2 class="wizard-title">Create New Event</h2>
    </template>

    <Stepper value="1" linear id="stepper">
      <StepList>
        <Step value="1">Time & Place</Step>
        <Step v-if="wizardStore.formData.enabledSteps.music" value="2">Music</Step>
        <Step v-if="wizardStore.formData.enabledSteps.drinksAndFood" 
             :value="wizardStore.formData.enabledSteps.music ? '3' : '2'">
          Drinks & Food
        </Step>
        <Step :value="getStepValue(4)">Review</Step>
      </StepList>

      <StepPanels>
        <!-- Time & Place Step (always included) -->
        <StepPanel v-slot="{ activateCallback }" value="1">
          <TimeAndPlaceStep ref="timeAndPlaceStep" />
          <div class="wizard-actions">
            <div></div> <!-- Empty div for spacing -->
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="() => {
              if (timeAndPlaceStep?.isValid) {
                activateCallback(getNextStep('1'))
              } else {
                timeAndPlaceStep?.setTouched()
              }
            }" />
          </div>
        </StepPanel>

        <!-- Music Step (optional) -->
        <StepPanel v-if="wizardStore.formData.enabledSteps.music" v-slot="{ activateCallback }" value="2">
          <MusicStep />
          <div class="wizard-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="() => activateCallback('1')" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" 
                   @click="() => activateCallback(wizardStore.formData.enabledSteps.drinksAndFood ? '3' : getStepValue(4))" />
          </div>
        </StepPanel>

        <!-- Drinks & Food Step (optional) -->
        <StepPanel v-if="wizardStore.formData.enabledSteps.drinksAndFood" 
                  v-slot="{ activateCallback }" 
                  :value="wizardStore.formData.enabledSteps.music ? '3' : '2'">
          <DrinksAndFoodStep />
          <div class="wizard-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" 
                   @click="() => activateCallback(wizardStore.formData.enabledSteps.music ? '2' : '1')" />
            <Button label="Next" icon="pi pi-arrow-right" iconPos="right" 
                   @click="() => activateCallback(getStepValue(4))" />
          </div>
        </StepPanel>

        <!-- Review Step (always included, but with variable value) -->
        <StepPanel v-slot="{ activateCallback }" :value="getStepValue(4)">
          <ReviewStep />
          <div class="wizard-actions">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="() => {
              if (wizardStore.formData.enabledSteps.drinksAndFood) {
                activateCallback(wizardStore.formData.enabledSteps.music ? '3' : '2')
              } else if (wizardStore.formData.enabledSteps.music) {
                activateCallback('2')
              } else {
                activateCallback('1')
              }
            }" />
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