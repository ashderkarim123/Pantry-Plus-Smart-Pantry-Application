'use client';

import { useState, useEffect } from 'react';
import { db, ShoppingItem } from '@/lib/db/dexie';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadItems = async () => {
      const localItems = await db.shopping.toArray();
      setItems(localItems);
      setLoading(false);
    };
    loadItems();
  }, []);

  useEffect(() => {
    if (!user || !firestore) return;

    const q = query(
      collection(firestore, 'shopping'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = change.doc.data();
        const item: ShoppingItem = {
          firebaseId: change.doc.id,
          name: data.name,
          quantity: data.quantity,
          unit: data.unit,
          category: data.category,
          purchased: data.purchased,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          syncStatus: 'synced',
        };

        if (change.type === 'added' || change.type === 'modified') {
          await db.shopping.put(item);
        } else if (change.type === 'removed') {
          await db.shopping.where('firebaseId').equals(change.doc.id).delete();
        }
      });

      const localItems = await db.shopping.toArray();
      setItems(localItems);
    });

    return unsubscribe;
  }, [user]);

  const addItem = async (item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    const now = new Date().toISOString();
    const newItem: ShoppingItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    const id = await db.shopping.add(newItem);

    if (user && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'shopping'), {
          ...newItem,
          userId: user.uid,
        });
        
        await db.shopping.update(id, {
          firebaseId: docRef.id,
          syncStatus: 'synced',
        });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.shopping.update(id, { syncStatus: 'error' });
      }
    }

    const updatedItems = await db.shopping.toArray();
    setItems(updatedItems);
  };

  const updateItem = async (id: number, updates: Partial<ShoppingItem>) => {
    const item = await db.shopping.get(id);
    if (!item) return;

    const updatedItem = {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: user ? 'pending' as const : 'synced' as const,
    };

    await db.shopping.update(id, updatedItem);

    if (user && item.firebaseId && firestore) {
      try {
        const docRef = doc(firestore, 'shopping', item.firebaseId);
        await updateDoc(docRef, {
          ...updatedItem,
          syncStatus: 'synced',
        });
        
        await db.shopping.update(id, { syncStatus: 'synced' });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.shopping.update(id, { syncStatus: 'error' });
      }
    }

    const updatedItems = await db.shopping.toArray();
    setItems(updatedItems);
  };

  const deleteItem = async (id: number) => {
    const item = await db.shopping.get(id);
    if (!item) return;

    await db.shopping.delete(id);

    if (user && item.firebaseId && firestore) {
      try {
        await deleteDoc(doc(firestore, 'shopping', item.firebaseId));
      } catch (error) {
        console.error('Error deleting from Firebase:', error);
      }
    }

    const updatedItems = await db.shopping.toArray();
    setItems(updatedItems);
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
  };
}
