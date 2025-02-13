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

interface DrinkData {
  id: string
  name: string
}

export interface WizardData {
  name: string
  date: Date | null
  time: Date | null
  location: { lat: number; lng: number } | null
  artists: Artist[]
  drinks: DrinkData[]
  food: string[]
  locationDescription?: string
}

export const useWizardStore = defineStore('wizard', () => {
  const formData = ref<WizardData>({
    name: '',
    date: null,
    time: null,
    location: null,
    artists: [],
    drinks: [],
    food: [],
    locationDescription: ''
  })

  const resetForm = () => {
    formData.value = {
      name: '',
      date: null,
      time: null,
      location: null,
      artists: [],
      drinks: [],
      food: [],
      locationDescription: ''
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