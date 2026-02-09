import React, { useState, useEffect } from "react";
import { RecipeFormData } from "../types/recipe";
import { Recipe } from "../types/recipe";

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => void;
  isLoading?: boolean;
  initialData?: Recipe;
  mode?: "create" | "edit";
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, isLoading, initialData, mode = "create" }) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    summary: "",
    readyInMinutes: 0,
    servings: 1,
    imageUrl: "",
    imageFiles: [],
    mealType: "",
    ingredients: [{ original: "", name: "", amount: null, unit: null }],
    instructions: [{ stepNumber: 1, stepText: "", instructionGroup: "" }],
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Initialize form with existing recipe data in edit mode
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        title: initialData.title,
        summary: initialData.summary || "",
        readyInMinutes: initialData.readyInMinutes,
        servings: initialData.servings,
        imageUrl: initialData.image || "",
        imageFiles: [],
        mealType: initialData.mealType || "",
        ingredients: initialData.extendedIngredients.map(ing => ({
          original: ing.original,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        })),
        instructions: initialData.analyzedInstructions.flatMap(group =>
          group.steps.map(step => ({
            stepNumber: step.number,
            stepText: step.step,
            instructionGroup: group.name !== "Instructions" ? group.name : "",
          }))
        ),
      });

      // Set existing images
      if (initialData.images && initialData.images.length > 0) {
        setExistingImages(initialData.images);
      }
    }
  }, [initialData, mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData({
        ...formData,
        imageFiles: files
      });

      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeNewImage = (index: number) => {
    const newFiles = formData.imageFiles?.filter((_, i) => i !== index) || [];
    const newPreviews = previews.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      imageFiles: newFiles
    });
    setPreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  const mealTypes = [

    "Main Course",
    "Side Dish",
    "Dessert",
    "Appetizer",
    "Salad",
    "Bread",
    "Breakfast",
    "Soup",
    "Beverage",
    "Sauce",
    "Marinade",
    "Fingerfood",
    "Snack",
    "Drink",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      existingImages: existingImages, // Include the current state of existing images
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { original: "", name: "", amount: null, unit: null },
      ],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [
        ...formData.instructions,
        {
          stepNumber: formData.instructions.length + 1,
          stepText: "",
          instructionGroup: "",
        },
      ],
    });
  };

  const removeInstruction = (index: number) => {
    const updated = formData.instructions
      .filter((_, i) => i !== index)
      .map((inst, i) => ({ ...inst, stepNumber: i + 1 }));
    setFormData({ ...formData, instructions: updated });
  };

  const updateInstruction = (
    index: number,
    field: keyof RecipeFormData["instructions"][0],
    value: string | number
  ) => {
    const updated = [...formData.instructions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, instructions: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ready In (minutes) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.readyInMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    readyInMinutes: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servings*
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.servings}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    servings: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Type
            </label>
            <select
              value={formData.mealType}
              onChange={(e) =>
                setFormData({ ...formData, mealType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select meal type</option>
              {mealTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Images (Multiple allowed)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Existing Images:</p>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {existingImages.map((src, idx) => (
                    <div key={idx} className="flex-shrink-0 relative w-40 h-40 group">
                      <img
                        src={src}
                        alt={`Existing ${idx}`}
                        className="w-full h-full object-cover rounded-md shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">New Images to Add:</p>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="flex-shrink-0 relative w-40 h-40 group">
                      <img
                        src={src}
                        alt={`Preview ${idx}`}
                        className="w-full h-full object-cover rounded-md shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Ingredients</h2>
          <button
            type="button"
            onClick={addIngredient}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            + Add Ingredient
          </button>
        </div>
        <div className="space-y-4">
          {formData.ingredients.map((ingredient, index) => (
            <div key={`ingredient-${index}`} className="flex gap-2 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient {index + 1} *
                </label>
                <input
                  type="text"
                  required
                  value={ingredient.original || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const updated = [...formData.ingredients];
                    updated[index] = {
                      ...updated[index],
                      original: value,
                      // Try to parse name from original (simple parsing)
                      name: value.split(" ").length > 0 ? value.split(" ")[value.split(" ").length - 1] : ""
                    };
                    setFormData({ ...formData, ingredients: updated });
                  }}
                  placeholder="e.g., 1 cup sugar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="mt-6 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Instructions</h2>
          <button
            type="button"
            onClick={addInstruction}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            + Add Step
          </button>
        </div>
        <div className="space-y-4">
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-700">
                    Step {instruction.stepNumber}
                  </span>
                  {instruction.instructionGroup && (
                    <span className="text-sm text-gray-500">
                      ({instruction.instructionGroup})
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Instruction group (optional)"
                  value={instruction.instructionGroup || ""}
                  onChange={(e) =>
                    updateInstruction(index, "instructionGroup", e.target.value)
                  }
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  required
                  value={instruction.stepText}
                  onChange={(e) =>
                    updateInstruction(index, "stepText", e.target.value)
                  }
                  rows={2}
                  placeholder="Enter instruction step..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {formData.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="mt-8 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading
            ? (mode === "edit" ? "Updating..." : "Creating...")
            : (mode === "edit" ? "Update Recipe" : "Create Recipe")}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
