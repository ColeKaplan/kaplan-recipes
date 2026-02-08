import { useQuery } from "react-query";
import { RecipeListItem } from "../types/recipe";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];

const useSearch = (
  keyword: string,
  pageNumber: number,
  pageSize: number,
  mealType: string
) => {
  const fetchFood = async (): Promise<RecipeListItem[]> => {
    let query = supabase
      .from("recipes")
      .select("id, title, image_url, ready_in_minutes, servings, meal_type, aggregate_rating, rating_count")
      .order("created_at", { ascending: false });

    // Filter by keyword (search in title)
    if (keyword && keyword.trim() !== "") {
      query = query.ilike("title", `%${keyword}%`);
    }

    // Filter by meal type
    if (mealType && mealType.trim() !== "") {
      query = query.eq("meal_type", mealType);
    }

    // Pagination
    const from = pageNumber * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to);

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
      aggregateRating: recipe.aggregate_rating || undefined,
      ratingCount: recipe.rating_count || undefined,
    }));
  };

  return useQuery<RecipeListItem[], Error>(
    ["recipes", keyword, pageNumber, pageSize, mealType],
    fetchFood,
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // cache for 1 minute
    }
  );
};

export default useSearch;
