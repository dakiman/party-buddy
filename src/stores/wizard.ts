import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Artist {
  id: string
  name: string
  images: Array<{
    url: string
    height: number
    width: number
  }>
  genres: string[]
  followers: number
  popularity: number
  spotifyUrl: string
}

export interface WizardData {
  date: Date | null
  time: Date | null
  location: { lat: number; lng: number } | null
  artists: Artist[]
  // We can easily add more fields here as we add more steps
}

export const useWizardStore = defineStore('wizard', () => {
  const formData = ref<WizardData>({
    date: null,
    time: null,
    location: null,
    artists: []
  })

  const resetForm = () => {
    formData.value = {
      date: null,
      time: null,
      location: null,
      artists: []
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