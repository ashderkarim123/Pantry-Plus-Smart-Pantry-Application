'use client';

import { useState, useEffect } from 'react';
import { db, InventoryItem } from '@/lib/db/dexie';
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

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load items from IndexedDB on mount
  useEffect(() => {
    const loadItems = async () => {
      const localItems = await db.inventory.toArray();
      setItems(localItems);
      setLoading(false);
    };
    loadItems();
  }, []);

  // Sync with Firebase when user is authenticated
  useEffect(() => {
    if (!user || !firestore) return;

    const q = query(
      collection(firestore, 'inventory'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = change.doc.data();
        const item: InventoryItem = {
          firebaseId: change.doc.id,
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          unit: data.unit,
          expiryDate: data.expiryDate,
          barcode: data.barcode,
          location: data.location,
          notes: data.notes,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          syncStatus: 'synced',
        };

        if (change.type === 'added' || change.type === 'modified') {
          await db.inventory.put(item);
        } else if (change.type === 'removed') {
          await db.inventory.where('firebaseId').equals(change.doc.id).delete();
        }
      });

      // Reload items from IndexedDB
      const localItems = await db.inventory.toArray();
      setItems(localItems);
    });

    return unsubscribe;
  }, [user]);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    // Add to IndexedDB
    const id = await db.inventory.add(newItem);

    // Sync to Firebase if user is authenticated
    if (user && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'inventory'), {
          ...newItem,
          userId: user.uid,
        });
        
        // Update local item with Firebase ID
        await db.inventory.update(id, {
          firebaseId: docRef.id,
          syncStatus: 'synced',
        });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.inventory.update(id, { syncStatus: 'error' });
      }
    }

    // Reload items
    const updatedItems = await db.inventory.toArray();
    setItems(updatedItems);
  };

  const updateItem = async (id: number, updates: Partial<InventoryItem>) => {
    const item = await db.inventory.get(id);
    if (!item) return;

    const updatedItem = {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: user ? 'pending' as const : 'synced' as const,
    };

    // Update in IndexedDB
    await db.inventory.update(id, updatedItem);

    // Sync to Firebase if user is authenticated and item has firebaseId
    if (user && item.firebaseId && firestore) {
      try {
        const docRef = doc(firestore, 'inventory', item.firebaseId);
        await updateDoc(docRef, {
          ...updatedItem,
          syncStatus: 'synced',
        });
        
        await db.inventory.update(id, { syncStatus: 'synced' });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.inventory.update(id, { syncStatus: 'error' });
      }
    }

    // Reload items
    const updatedItems = await db.inventory.toArray();
    setItems(updatedItems);
  };

  const deleteItem = async (id: number) => {
    const item = await db.inventory.get(id);
    if (!item) return;

    // Delete from IndexedDB
    await db.inventory.delete(id);

    // Delete from Firebase if user is authenticated and item has firebaseId
    if (user && item.firebaseId && firestore) {
      try {
        await deleteDoc(doc(firestore, 'inventory', item.firebaseId));
      } catch (error) {
        console.error('Error deleting from Firebase:', error);
      }
    }

    // Reload items
    const updatedItems = await db.inventory.toArray();
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
