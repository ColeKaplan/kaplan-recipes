import React from "react";
import { Link } from "react-router-dom";
import { RecipeListItem } from "../types/recipe";

interface FoodCardProps {
  recipe: RecipeListItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ recipe }) => {
  // Construct the image URL using the Spoonacular API's image base URL and the image file name from the recipe object
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const imageUrl =
    (recipe.image &&
      (isValidUrl(recipe.image)
        ? recipe.image
        : `https://spoonacular.com/recipeImages/${recipe.image}`)) ||
    "https://via.placeholder.com/300x150?text=No%20Image";

  return (
    <Link to={`/recipe/${recipe.id}`}>
      <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-lg relative hover:underline">
        {/* Food Image */}
        <img
          className="h-48 w-full object-cover"
          src={imageUrl}
          alt={recipe.title}
        />
        {/* Cook time badge */}
        <div className="flex bg-gray-700 text-white rounded-l-md p-1 items-center absolute top-2 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-base text-center">{recipe.readyInMinutes} min</p>
        </div>
        {/* Food title */}
        <div className="px-6 py-4 ">
          <div className="font-bold  mb-2 text-gray-700">{recipe.title}</div>
          {recipe.aggregateRating !== undefined && recipe.aggregateRating > 0 && (
            <div className="flex items-center text-yellow-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{recipe.aggregateRating.toFixed(1)}</span>
              {recipe.ratingCount && (
                <span className="text-gray-400 text-sm ml-1">
                  ({recipe.ratingCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FoodCard;
