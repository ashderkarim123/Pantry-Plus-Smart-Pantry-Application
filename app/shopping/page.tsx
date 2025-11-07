'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useShopping } from '@/lib/hooks/useShopping';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Shopping() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { items, loading: shoppingLoading, addItem, updateItem, deleteItem } = useShopping();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem({
      ...formData,
      purchased: false,
    });
    setShowAddModal(false);
    setFormData({
      name: '',
      quantity: 1,
      unit: 'pieces',
      category: '',
    });
  };

  const togglePurchased = async (item: { id?: number; purchased: boolean }) => {
    if (item.id) {
      await updateItem(item.id, { purchased: !item.purchased });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  if (authLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const activeItems = items.filter(item => !item.purchased);
  const purchasedItems = items.filter(item => item.purchased);

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
                <Link href="/shopping" className="text-indigo-600 font-semibold">
                  Shopping
                </Link>
                <Link href="/recipes" className="text-gray-600 hover:text-gray-900">
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Shopping List</h2>
            <p className="text-gray-600 mt-1">{activeItems.length} items to buy</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            + Add Item
          </button>
        </div>

        {shoppingLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Items */}
            {activeItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">To Buy</h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {activeItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={item.purchased}
                          onChange={() => togglePurchased(item)}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                            {item.category && ` • ${item.category}`}
                          </p>
                        </div>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Purchased</h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {purchasedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg opacity-60"
                      >
                        <input
                          type="checkbox"
                          checked={item.purchased}
                          onChange={() => togglePurchased(item)}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 line-through">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                            {item.category && ` • ${item.category}`}
                          </p>
                        </div>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Your shopping list is empty. Add items to get started!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Shopping Item</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="kg">Kg</option>
                      <option value="g">Grams</option>
                      <option value="l">Liters</option>
                      <option value="ml">ML</option>
                      <option value="lbs">Lbs</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Produce, Dairy, Meat"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
