import React, { useState } from "react";
import { RecipeFormData } from "../types/recipe";

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => void;
  isLoading?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    summary: "",
    readyInMinutes: 0,
    servings: 1,
    imageUrl: "",
    mealType: "",
    ingredients: [{ original: "", name: "", amount: null, unit: null }],
    instructions: [{ stepNumber: 1, stepText: "", instructionGroup: "" }],
  });

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
    onSubmit(formData);
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

  const updateIngredient = (
    index: number,
    field: keyof RecipeFormData["ingredients"][0],
    value: string | number | null
  ) => {
    const updated = [...formData.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ingredients: updated });
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
                    readyInMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servings *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.servings}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    servings: parseInt(e.target.value) || 1,
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
              Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          {isLoading ? "Creating..." : "Create Recipe"}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
