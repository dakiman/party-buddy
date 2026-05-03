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
  // Comma-join: Spring's @RequestParam List<String> splits on `,`. Default
  // axios serialization (`ingredients[]=foo`) is bracketed and Spring ignores it.
  const { data } = await api.get<GetDrinksResponse>('/drinks', {
    params: { ingredients: ingredientNames.join(',') },
  })
  return data.drinks
}
