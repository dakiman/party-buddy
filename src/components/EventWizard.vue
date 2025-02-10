<script setup lang="ts">
import { ref } from 'vue'
import Steps from 'primevue/steps'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import TimeAndPlaceStep from './steps/TimeAndPlaceStep.vue'

const visible = ref(false)
const currentStep = ref(0)
const timeAndPlaceStep = ref()

const items = [
  { label: 'Time & Place' },
  { label: 'Details' },
  { label: 'Review' }
]

const show = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
  currentStep.value = 0
}

const nextStep = () => {
  if (currentStep.value === 0) {
    timeAndPlaceStep.value?.setTouched()
    if (!timeAndPlaceStep.value?.isValid) {
      return
    }
  }
  currentStep.value++
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

    <Steps
      :model="items"
      :readonly="false"
      :class="'wizard-steps'"
      v-model:activeIndex="currentStep"
    />

    <div class="step-content">
      <TimeAndPlaceStep 
        v-if="currentStep === 0"
        ref="timeAndPlaceStep"
      />

      <div v-if="currentStep === 1">
        <h3>Details</h3>
        <p>Step content coming soon...</p>
      </div>
      <div v-if="currentStep === 2">
        <h3>Review</h3>
        <p>Step content coming soon...</p>
      </div>
    </div>

    <div class="wizard-actions">
      <Button
        label="Back"
        class="p-button-outlined"
        @click="currentStep--"
        :disabled="currentStep === 0"
      />
      <Button
        v-if="currentStep < items.length - 1"
        label="Next"
        @click="nextStep"
      />
      <Button
        v-else
        label="Finish"
        severity="success"
        @click="close"
      />
    </div>
  </Dialog>
</template>

<style scoped>
.wizard-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

:deep(.wizard-steps) {
  margin: 2rem 0;
}

.step-content {
  min-height: 300px;
  padding: 1rem;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
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

:deep(.p-steps) {
  background-color: transparent;
}

:deep(.p-steps-item .p-menuitem-link) {
  background-color: transparent;
}

:deep(.p-steps-number) {
  color: var(--text-color);
}

:deep(.p-steps-title) {
  color: var(--text-color);
}
</style> 