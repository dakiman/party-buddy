import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WizardData {
  date: Date | null
  time: Date | null
  location: { lat: number; lng: number } | null
  // We can easily add more fields here as we add more steps
}

export const useWizardStore = defineStore('wizard', () => {
  const formData = ref<WizardData>({
    date: null,
    time: null,
    location: null
  })

  const resetForm = () => {
    formData.value = {
      date: null,
      time: null,
      location: null
    }
  }

  const updateFormData = (data: Partial<WizardData>) => {
    formData.value = {
      ...formData.value,
      ...data
    }
  }

  return {
    formData,
    resetForm,
    updateFormData
  }
}) 