import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import RecipeForm from "../components/RecipeForm";
import useUpdateRecipe from "../hooks/useUpdateRecipe";
import useFetchRecipe from "../hooks/useFetchRecipe";
import { RecipeFormData } from "../types/recipe";
import LoadIcon from "../img/icon/loading.gif";

const EditRecipe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const updateRecipe = useUpdateRecipe();
    const { data: recipe, isLoading, isError } = useFetchRecipe(id);

    const handleSubmit = async (formData: RecipeFormData) => {
        if (!id) return;

        try {
            const result = await updateRecipe.mutateAsync({ recipeId: id, formData });
            if (result.success) {
                navigate(`/recipe/${id}`);
            }
        } catch (error) {
            console.error("Error updating recipe:", error);
            alert("Failed to update recipe. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <>
                <NavBar />
                <div className="h-screen bg-gray-200 flex justify-center items-center w-full">
                    <img src={LoadIcon} alt="" className="h-2/4" />
                </div>
                <Footer />
            </>
        );
    }

    if (isError || !recipe) {
        return (
            <>
                <NavBar />
                <div className="h-screen bg-gray-200 flex justify-center items-center">
                    <h1>
                        Recipe not found. Please check the URL or try again later.
                    </h1>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <NavBar />
            <div className="container min-h-screen mx-auto px-6 py-24 bg-gray-100">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-center">
                        Edit Recipe
                    </h1>
                    {updateRecipe.isError && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            <p className="font-semibold">Error updating recipe:</p>
                            <p>
                                {updateRecipe.error instanceof Error
                                    ? updateRecipe.error.message
                                    : "An unknown error occurred"}
                            </p>
                        </div>
                    )}
                    <RecipeForm
                        onSubmit={handleSubmit}
                        isLoading={updateRecipe.isLoading}
                        initialData={recipe}
                        mode="edit"
                    />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EditRecipe;
