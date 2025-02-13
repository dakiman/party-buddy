<script setup lang="ts">
import { ref } from 'vue'
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
import { createEvent } from '@/services/api'
import { useToast } from 'primevue/usetoast'

const visible = ref(false)
const timeAndPlaceStep = ref()
const wizardStore = useWizardStore()
const toast = useToast()
const loading = ref(false)

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
    
    // Format the data according to the API requirements
    const eventData = {
      name: "My Party", // You might want to make this dynamic
      isPrivate: wizardStore.formData.isPrivate,
      date: wizardStore.formData.date?.toISOString().split('T')[0],
      time: wizardStore.formData.time?.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      location: wizardStore.formData.location ? {
        lat: wizardStore.formData.location.lat,
        lng: wizardStore.formData.location.lng,
        locationDescription: wizardStore.formData.locationDescription
      } : null,
      artists: wizardStore.formData.artists.map(artist => ({
        id: artist.id,
        name: artist.name,
        images: artist.images,
        genres: artist.genres,
        spotifyUrl: artist.spotifyUrl
      })),
      drinks: wizardStore.formData.drinks.map(drink => drink.id),
      food: wizardStore.formData.food
    }

    await createEvent(eventData)
    toast.add({
      severity: 'success',
      summary: 'Event Created!',
      detail: 'Your event has been created successfully.',
      life: 3000
    })
    close()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Creation Failed',
      detail: 'Unable to create Event currently. Please try again later.',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

defineExpose({
  show
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :style="{ width: '90vw', maxWidth: '800px' }"
    :closable="true"
    @hide="close"
  >
    <template #header>
      <h2 class="wizard-title">Create New Event</h2>
    </template>

    <Stepper value="1" linear id="stepper">
      <StepList>
        <Step value="1">Time & Place</Step>
        <Step value="2">Music</Step>
        <Step value="3">Drinks & Food</Step>
        <Step value="4">Review</Step>
      </StepList>

      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1">
          <TimeAndPlaceStep ref="timeAndPlaceStep" />
          <div class="wizard-actions">
            <div></div> <!-- Empty div for spacing -->
            <Button
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="() => {
                if (timeAndPlaceStep?.isValid) {
                  activateCallback('2')
                } else {
                  timeAndPlaceStep?.setTouched()
                }
              }"
            />
          </div>
        </StepPanel>

        <StepPanel v-slot="{ activateCallback }" value="2">
          <MusicStep />
          <div class="wizard-actions">
            <Button
              label="Back"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="() => activateCallback('1')"
            />
            <Button
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="() => activateCallback('3')"
            />
          </div>
        </StepPanel>

        <StepPanel v-slot="{ activateCallback }" value="3">
          <DrinksAndFoodStep />
          <div class="wizard-actions">
            <Button
              label="Back"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="() => activateCallback('2')"
            />
            <Button
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="() => activateCallback('4')"
            />
          </div>
        </StepPanel>

        <StepPanel v-slot="{ activateCallback }" value="4">
          <ReviewStep />
          <div class="wizard-actions">
            <Button
              label="Back"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="() => activateCallback('3')"
            />
            <Button
              label="Finish"
              severity="success"
              icon="pi pi-check"
              :loading="loading"
              @click="handleFinish"
            />
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