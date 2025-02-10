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
import { useWizardStore } from '@/stores/wizard'

const visible = ref(false)
const timeAndPlaceStep = ref()
const wizardStore = useWizardStore()

const show = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
  wizardStore.resetForm()
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

    <Stepper value="1" linear>
      <StepList>
        <Step value="1">Time & Place</Step>
        <Step value="2">Details</Step>
        <Step value="3">Review</Step>
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
          <div class="details-step">
            <h3>Details</h3>
            <p>Step content coming soon...</p>
          </div>
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
          <div class="review-step">
            <h3>Review</h3>
            <pre>{{ wizardStore.formData }}</pre>
          </div>
          <div class="wizard-actions">
            <Button
              label="Back"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="() => activateCallback('2')"
            />
            <Button
              label="Finish"
              severity="success"
              icon="pi pi-check"
              @click="close"
            />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Dialog>
</template>

<style scoped>
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
  border-top: 1px solid var(--surface-border);
}

.details-step,
.review-step {
  min-height: 300px;
}

:deep(.p-dialog) {
  background-color: #1E1E1E;
  border-radius: 8px;
}

:deep(.p-dialog-header) {
  padding: 1.5rem;
  background-color: transparent;
  border-bottom: 1px solid var(--surface-border);
  color: var(--text-color);
}

:deep(.p-dialog-content) {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background-color: transparent;
  color: var(--text-color);
}
</style> 