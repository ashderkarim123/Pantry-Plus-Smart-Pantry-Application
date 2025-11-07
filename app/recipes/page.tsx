'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInventory } from '@/lib/hooks/useInventory';

export default function Recipes() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { items } = useInventory();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Sample recipes - in a real app, these would come from a database
  const sampleRecipes = [
    {
      id: 1,
      name: 'Pasta Carbonara',
      description: 'Classic Italian pasta dish with eggs, cheese, and bacon',
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper'],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
    },
    {
      id: 2,
      name: 'Chicken Stir Fry',
      description: 'Quick and healthy Asian-inspired stir fry',
      ingredients: ['chicken breast', 'vegetables', 'soy sauce', 'garlic', 'ginger'],
      prepTime: 15,
      cookTime: 15,
      servings: 4,
    },
    {
      id: 3,
      name: 'Garden Salad',
      description: 'Fresh and healthy mixed greens salad',
      ingredients: ['lettuce', 'tomatoes', 'cucumber', 'olive oil', 'vinegar'],
      prepTime: 10,
      cookTime: 0,
      servings: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
                PantryPlus
              </Link>
              <nav className="hidden md:flex gap-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/inventory" className="text-gray-600 hover:text-gray-900">
                  Inventory
                </Link>
                <Link href="/shopping" className="text-gray-600 hover:text-gray-900">
                  Shopping
                </Link>
                <Link href="/recipes" className="text-indigo-600 font-semibold">
                  Recipes
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden md:inline">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recipe Planner</h2>
          <p className="text-gray-600 mt-1">
            Discover recipes based on your available ingredients
          </p>
        </div>

        {/* Available Ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Your Available Ingredients ({items.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {items.slice(0, 10).map((item) => (
              <span
                key={item.id}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {item.name}
              </span>
            ))}
            {items.length > 10 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                +{items.length - 10} more
              </span>
            )}
            {items.length === 0 && (
              <p className="text-gray-500">
                No ingredients yet. Add items to your inventory to get recipe suggestions.
              </p>
            )}
          </div>
        </motion.div>

        {/* Sample Recipes */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Recipes</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                  <span className="text-6xl">🍳</span>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{recipe.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                    <span>👥 {recipe.servings} servings</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          +{recipe.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    View Recipe
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Future Feature Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center"
        >
          <p className="text-indigo-700">
            <strong>Coming Soon:</strong> AI-powered recipe suggestions based on your inventory,
            ingredient matching, and custom recipe creation!
          </p>
        </motion.div>
      </main>
    </div>
  );
}
