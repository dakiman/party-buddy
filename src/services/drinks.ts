import api from './api'
import type { Cocktail } from '@/types'

interface GetDrinksResponse {
  drinks: Cocktail[]
}

export async function getAllDrinks(): Promise<Cocktail[]> {
  const { data } = await api.get<GetDrinksResponse>('/drinks')
  return data.drinks
}

export async function getDrinksByIngredients(ingredientNames: string[]): Promise<Cocktail[]> {
  const { data } = await api.get<GetDrinksResponse>('/drinks', {
    params: { ingredients: ingredientNames },
  })
  return data.drinks
}
