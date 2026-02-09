import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import useFetchRecipe from "../hooks/useFetchRecipe";
import { supabase } from "../lib/supabase";
import LoadIcon from "../img/icon/loading.gif";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Recipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: recipe, isLoading, isError } = useFetchRecipe(id);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleRate = async (rating: number) => {
    if (!recipe) return;

    const currentRating = recipe.aggregateRating || 0;
    const currentCount = recipe.ratingCount || 0;

    let newRating: number;
    let newCount: number;

    if (userRating) {
      // User is updating their rating
      // Formula: (CurrentAvg * Count - OldUserRating + NewUserRating) / Count
      newCount = currentCount;
      // Prevent division by zero if count is somehow 0 (shouldn't happen if userRating is set)
      const safeCount = currentCount > 0 ? currentCount : 1;
      const oldTotal = currentRating * safeCount;
      newRating = (oldTotal - userRating + rating) / safeCount;
    } else {
      // New rating
      newCount = currentCount + 1;
      newRating = ((currentRating * currentCount) + rating) / newCount;
    }

    const updates: any = { aggregate_rating: newRating, rating_count: newCount };

    const { error } = await (supabase
      .from("recipes") as any)
      .update(updates)
      .eq("id", recipe.id);

    if (!error) {
      setUserRating(rating);
      queryClient.setQueryData(["recipe", id], {
        ...recipe,
        aggregateRating: newRating,
        ratingCount: newCount,
      });
    } else {
      console.error("Error updating rating:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-200 flex justify-center items-center w-full">
        <img src={LoadIcon} alt="" className="h-2/4" />
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="h-screen bg-gray-200 flex justify-center items-center">
        <h1>
          Something went wrong. Please refresh the page or try again later.
        </h1>
      </div>
    );
  }

  const recipeImage = recipe.image
    ? recipe.image
    : "https://via.placeholder.com/640x360?text=No+Image";

  return (
    <>
      <NavBar />
      <div className="container min-h-screen mx-auto px-6 py-24 text-xl">
        <div className="flex flex-col justify-center items-center">
          {/* Recipe image(s) - only show if images exist */}
          {((recipe.images && recipe.images.length > 0) || recipe.image) && (
            <div className="w-full mb-8 relative group">
              <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg shadow-md overflow-hidden bg-gray-200 relative">
                <img
                  className="w-full h-full object-cover"
                  src={
                    (recipe.images && recipe.images.length > 0)
                      ? recipe.images[currentImageIndex]
                      : recipeImage
                  }
                  alt={recipe.title}
                />
              </div>

              {recipe.images && recipe.images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentImageIndex === 0}
                    title=""
                    className={`absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 ${currentImageIndex === 0 ? 'opacity-30 group-hover:opacity-30 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentImageIndex(prev => Math.min((recipe.images?.length || 1) - 1, prev + 1))}
                    disabled={currentImageIndex === ((recipe.images?.length || 1) - 1)}
                    title=""
                    className={`absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 ${currentImageIndex === ((recipe.images?.length || 1) - 1) ? 'opacity-30 group-hover:opacity-30 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {recipe.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/50'
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {/* Recipe details */}
          <div className="w-full lg:w-1/2 justify-center text-center align-center">
            {/* Recipe title */}
            <h1 className="text-3xl font-bold md:mb-5 mb-2">{recipe.title}</h1>

            {/* Edit button for logged-in users */}
            {isLoggedIn && (
              <div className="mb-4">
                <button
                  onClick={() => navigate(`/edit-recipe/${id}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                  Edit Recipe
                </button>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center mb-6 justify-center">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className={`bg-transparent border-0 focus:outline-none cursor-pointer hover:scale-110 transition-transform`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`w-6 h-6 ${userRating && userRating >= star
                        ? "text-yellow-500"
                        : "text-gray-300"
                        }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {recipe.aggregateRating ? recipe.aggregateRating.toFixed(1) : "No ratings"}
                <span className="text-sm text-gray-400 ml-1">({recipe.ratingCount || 0} reviews)</span>
              </span>
              {userRating && (
                <span className="ml-4 text-sm text-green-600 font-medium">
                  Thanks for rating!
                </span>
              )}
            </div>
            {/* Recipe summary */}
            {recipe.summary && (
              <div
                className="mb-4 indent-8 text-center"
                dangerouslySetInnerHTML={{ __html: recipe.summary }}
              ></div>
            )}
            {/* Recipe info */}
            <div className="w-full flex mb-4 justify-center">
              <h2 className="font-bold pr-2">Cooking Time</h2>
              <p>{recipe.readyInMinutes} minutes</p>
              <h2 className=" pl-8 pr-2 font-bold">Servings</h2>
              <p>{recipe.servings}</p>
            </div>
            <div className="w-fit md:w-1/2 mb-4 mx-auto">
              <h2 className="font-bold mb-2">Ingredients</h2>
              <ul className="list-disc text-left list-inside ml-6 pr-2">
                {recipe.extendedIngredients.map((ingredient) => (
                  <li key={ingredient.id}>{ingredient.original}</li>
                ))}
              </ul>
            </div>
            {/* Cooking process */}
            <div className="w-fit mt-8">
              <h2 className="font-bold mb-4 text-2xl">Cooking Process</h2>
              {recipe.analyzedInstructions.map((instruction, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-bold mb-2">{instruction.name}</h3>
                  <ol className="list-decimal text-left list-inside ml-6">
                    {instruction.steps.map((step) => (
                      <li key={step.number}>{step.step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div >
      <Footer />
    </>
  );
};

export default Recipe;
