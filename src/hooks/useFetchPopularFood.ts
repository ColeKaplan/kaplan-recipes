import { useQuery } from "react-query";
import { RecipeListItem } from "../types/recipe";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];

const useFetchPopularFood = (pageNumber: number, pageSize: number) => {
  const fetchPopularFood = async (): Promise<RecipeListItem[]> => {
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, image_url, ready_in_minutes, servings, meal_type, aggregate_rating, rating_count")
      .order("aggregate_rating", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    // Transform to RecipeListItem format
    const typedData = (data || []) as Pick<RecipeRow, "id" | "title" | "image_url" | "ready_in_minutes" | "servings" | "meal_type" | "aggregate_rating" | "rating_count">[];
    return typedData.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image_url,
      readyInMinutes: recipe.ready_in_minutes,
      servings: recipe.servings,
      mealType: recipe.meal_type || undefined,
      aggregateRating: recipe.aggregate_rating || 0,
      ratingCount: recipe.rating_count || 0,
    }));
  };

  return useQuery<RecipeListItem[], Error>(
    ["popularFood", pageNumber, pageSize],
    fetchPopularFood,
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // cache for 1 minute
    }
  );
};

export default useFetchPopularFood;
