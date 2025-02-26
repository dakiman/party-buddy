<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import EventWizard from './EventWizard.vue'
import { useWizardStore } from '../stores/wizard'
import Checkbox from 'primevue/checkbox'

const selectedType = ref<'private' | 'public' | null>(null)
const eventWizard = ref()
const wizardStore = useWizardStore()
const enableMusic = ref(true)
const enableDrinksAndFood = ref(true)

const showContinueButton = computed(() => selectedType.value !== null)

const selectType = (type: 'private' | 'public') => {
  selectedType.value = type
  wizardStore.updateFormData({ isPrivate: type === 'private' })
}

const handleContinue = () => {
  wizardStore.updateFormData({
    enabledSteps: {
      music: enableMusic.value,
      drinksAndFood: enableDrinksAndFood.value
    }
  })
  eventWizard.value.show()
}
</script>

<template>
  <div class="event-type-selector">
    <div class="type-buttons">
      <Button
        class="type-button"
        :class="{ selected: selectedType === 'private' }"
        @click="selectType('private')"
      >
        Private Party
      </Button>
      <Button
        class="type-button"
        :class="{ selected: selectedType === 'public' }"
        @click="selectType('public')"
      >
        Public Event
      </Button>
    </div>

    <div class="step-selection" v-if="selectedType">
      <h3>What would you like to include?</h3>
      <div class="step-options">
        <div class="option-item">
          <Checkbox v-model="enableMusic" :binary="true" inputId="music" />
          <label for="music">Music Selection</label>
        </div>
        <div class="option-item">
          <Checkbox v-model="enableDrinksAndFood" :binary="true" inputId="drinksAndFood" />
          <label for="drinksAndFood">Drinks & Food</label>
        </div>
      </div>
    </div>

    <transition name="fade">
      <Button
        v-if="showContinueButton"
        class="continue-button"
        @click="handleContinue"
      >
        Continue
      </Button>
    </transition>
  </div>
  
  <EventWizard ref="eventWizard" />
</template>

<style scoped>
.event-type-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.type-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.type-button {
  flex: 1;
  border: 2px solid #7B7EF6;
  transition: all 0.2s ease;
  color: #ffffff;
}

.type-button.selected {
  background-color: #7B7EF6;
  border-color: #7B7EF6;
}

.step-selection {
  background-color: rgba(123, 126, 246, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  text-align: left;
}

.step-selection h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #ffffff;
}

.step-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-item label {
  cursor: pointer;
}

.continue-button {
  width: 100%;
  background-color: #7B7EF6;
  border: none;
}

.continue-button:hover {
  background-color: #6366F1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 