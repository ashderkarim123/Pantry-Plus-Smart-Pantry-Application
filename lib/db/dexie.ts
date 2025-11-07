import Dexie, { Table } from 'dexie';

// Define interfaces for our database tables
export interface InventoryItem {
  id?: number;
  firebaseId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  barcode?: string;
  location?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface ShoppingItem {
  id?: number;
  firebaseId?: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface Recipe {
  id?: number;
  firebaseId?: string;
  name: string;
  description?: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface Alert {
  id?: number;
  firebaseId?: string;
  type: 'expiry' | 'low-stock' | 'out-of-stock';
  itemId: number;
  itemName: string;
  message: string;
  dismissed: boolean;
  createdAt: string;
}

// Dexie database class
export class PantryPlusDB extends Dexie {
  inventory!: Table<InventoryItem, number>;
  shopping!: Table<ShoppingItem, number>;
  recipes!: Table<Recipe, number>;
  alerts!: Table<Alert, number>;

  constructor() {
    super('PantryPlusDB');
    
    this.version(1).stores({
      inventory: '++id, firebaseId, name, category, expiryDate, syncStatus',
      shopping: '++id, firebaseId, name, purchased, syncStatus',
      recipes: '++id, firebaseId, name, syncStatus',
      alerts: '++id, firebaseId, type, itemId, dismissed',
    });
  }
}

// Create and export database instance
export const db = new PantryPlusDB();
