'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInventory } from '@/lib/hooks/useInventory';

export default function Dashboard() {
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

  // Calculate statistics
  const totalItems = items.length;
  const expiringItems = items.filter(item => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }).length;

  const expiredItems = items.filter(item => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < new Date();
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">PantryPlus</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.email}</span>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{expiringItems}</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Expired</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{expiredItems}</p>
                </div>
                <div className="text-4xl">🚫</div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/inventory"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">📦</div>
                <h4 className="font-semibold text-gray-900 mb-1">Inventory</h4>
                <p className="text-sm text-gray-600">Manage your pantry items</p>
              </Link>

              <Link
                href="/inventory?scan=true"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">📷</div>
                <h4 className="font-semibold text-gray-900 mb-1">Scan Barcode</h4>
                <p className="text-sm text-gray-600">Add items by scanning</p>
              </Link>

              <Link
                href="/shopping"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">🛒</div>
                <h4 className="font-semibold text-gray-900 mb-1">Shopping List</h4>
                <p className="text-sm text-gray-600">Create and manage lists</p>
              </Link>

              <Link
                href="/recipes"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">🍳</div>
                <h4 className="font-semibold text-gray-900 mb-1">Recipes</h4>
                <p className="text-sm text-gray-600">Find recipes to cook</p>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
