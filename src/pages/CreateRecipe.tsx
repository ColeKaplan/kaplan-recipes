import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import RecipeForm from "../components/RecipeForm";
import useCreateRecipe from "../hooks/useCreateRecipe";
import { RecipeFormData } from "../types/recipe";

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const createRecipe = useCreateRecipe();

  const handleSubmit = async (formData: RecipeFormData) => {
    try {
      const result = await createRecipe.mutateAsync(formData);
      if (result.success) {
        navigate(`/recipe/${result.recipe.id}`);
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe. Please try again.");
    }
  };

  return (
    <>
      <NavBar />
      <div className="container min-h-screen mx-auto px-6 py-24 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Create New Recipe
          </h1>
          {createRecipe.isError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-semibold">Error creating recipe:</p>
              <p>
                {createRecipe.error instanceof Error
                  ? createRecipe.error.message
                  : "An unknown error occurred"}
              </p>
            </div>
          )}
          <RecipeForm
            onSubmit={handleSubmit}
            isLoading={createRecipe.isLoading}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateRecipe;
