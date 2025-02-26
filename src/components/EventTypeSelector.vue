<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import EventWizard from './EventWizard.vue'
import { useWizardStore } from '../stores/wizard'

const selectedType = ref<'private' | 'public' | null>(null)
const eventWizard = ref()
const wizardStore = useWizardStore()

const showContinueButton = computed(() => selectedType.value !== null)

const selectType = (type: 'private' | 'public') => {
  selectedType.value = type
  wizardStore.updateFormData({ isPrivate: type === 'private' })
}

const handleContinue = () => {
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