import { useQuery } from "react-query";
import { RecipeListItem } from "../types/recipe";
import { api } from "../lib/api";

const useSearch = (
  keyword: string,
  pageNumber: number,
  pageSize: number,
  mealType: string
) => {
  return useQuery<RecipeListItem[], Error>(
    ["recipes", keyword, pageNumber, pageSize, mealType],
    async () => {
      const data = await api.recipes.search(keyword, mealType, pageNumber, pageSize);
      return (data || []).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image_url,
        readyInMinutes: recipe.ready_in_minutes,
        servings: recipe.servings,
        mealType: recipe.meal_type || undefined,
        aggregateRating: recipe.aggregate_rating || undefined,
        ratingCount: recipe.rating_count || undefined,
      }));
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    }
  );
};

export default useSearch;
