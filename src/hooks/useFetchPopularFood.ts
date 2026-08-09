import { useQuery } from "react-query";
import { RecipeListItem } from "../types/recipe";
import { api } from "../lib/api";

const useFetchPopularFood = (pageNumber: number, pageSize: number) => {
  return useQuery<RecipeListItem[], Error>(
    ["popularFood", pageNumber, pageSize],
    async () => {
      const data = await api.recipes.getPopular(pageNumber, pageSize);
      return (data || []).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image_url,
        readyInMinutes: recipe.ready_in_minutes,
        servings: recipe.servings,
        mealType: recipe.meal_type || undefined,
        aggregateRating: recipe.aggregate_rating || 0,
        ratingCount: recipe.rating_count || 0,
      }));
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    }
  );
};

export default useFetchPopularFood;
