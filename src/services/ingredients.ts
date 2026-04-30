import api from './api'
import type { Ingredient } from '@/types'

interface GetIngredientsResponse {
  ingredients: Ingredient[]
}

export async function getIngredients(
  isAlcoholic = true,
  name?: string,
): Promise<Ingredient[]> {
  const { data } = await api.get<GetIngredientsResponse>('/ingredients', {
    params: { isAlcoholic, ...(name ? { name } : {}) },
  })
  return data.ingredients
}
