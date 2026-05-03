import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Cocktail, IngredientPick } from '@/types'

export type { IngredientPick } from '@/types'

export interface Artist {
  id: string
  name: string
  images: Array<{ url: string; height: number; width: number }>
  genres: string[]
  followers: number
  popularity: number
  spotifyUrl: string
}

export interface WizardData {
  name: string
  date: Date | null
  time: Date | null
  location: { lat: number; lng: number } | null
  artists: Artist[]
  /** Renamed from `drinks`. The chip list under "Drinks (alcohols on hand)". */
  ingredients: IngredientPick[]
  /** New in Phase 7. Cocktails the host opted into from the suggestions panel. */
  cocktails: Cocktail[]
  food: string[]
  locationDescription?: string
  isPrivate: boolean
  enabledSteps: {
    music: boolean
    drinksAndFood: boolean
  }
}

const blankForm = (): WizardData => ({
  name: '',
  date: null,
  time: null,
  location: null,
  artists: [],
  ingredients: [],
  cocktails: [],
  food: [],
  locationDescription: '',
  isPrivate: true,
  enabledSteps: {
    music: true,
    drinksAndFood: true,
  },
})

export const useWizardStore = defineStore('wizard', () => {
  const formData = ref<WizardData>(blankForm())

  const resetForm = () => {
    formData.value = blankForm()
  }

  const updateFormData = (data: Partial<WizardData>) => {
    formData.value = { ...formData.value, ...data }
  }

  return { formData, resetForm, updateFormData }
})
