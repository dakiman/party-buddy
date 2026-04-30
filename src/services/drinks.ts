import api from './api'
import type { Drink } from '@/types'

interface GetDrinksResponse {
  drinks: Drink[]
}

export async function getAllDrinks(): Promise<Drink[]> {
  const { data } = await api.get<GetDrinksResponse>('/drinks')
  return data.drinks
}

export async function getDrinksByIngredients(ingredientNames: string[]): Promise<Drink[]> {
  const { data } = await api.get<GetDrinksResponse>('/drinks', {
    params: { ingredients: ingredientNames },
  })
  return data.drinks
}
