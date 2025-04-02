
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import type { Store } from '@/types';

export interface StoreSlice {
  stores: Store[];
  fetchStores: () => Promise<void>;
  addStore: (store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStore: (id: string, store: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
}

export const createStoreSlice = (set: any, get: any) => ({
  stores: [],
  
  // Fetch all stores from Firestore
  fetchStores: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "stores"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      
      const stores: Store[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stores.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        } as Store);
      });
      
      set({ stores, isLoading: false });
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les magasins",
        variant: "destructive"
      });
      set({ isLoading: false });
    }
  },
  
  // Add a store to Firestore
  addStore: async (storeData) => {
    set({ isLoading: true });
    try {
      const now = new Date();
      const store = {
        ...storeData,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, "stores"), store);
      
      // Update local state with the new store
      const newStore = {
        ...store,
        id: docRef.id,
      };
      
      set((state: any) => ({
        stores: [...state.stores, newStore],
        isLoading: false
      }));
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding store:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le magasin",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Update a store in Firestore
  updateStore: async (id, storeData) => {
    set({ isLoading: true });
    try {
      const storeRef = doc(db, "stores", id);
      const updatedData = {
        ...storeData,
        updatedAt: new Date(),
      };
      
      await updateDoc(storeRef, updatedData);
      
      // Update local state
      set((state: any) => ({
        stores: state.stores.map((s: Store) =>
          s.id === id ? { ...s, ...updatedData } : s
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error updating store:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le magasin",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Delete a store from Firestore
  deleteStore: async (id) => {
    set({ isLoading: true });
    try {
      await deleteDoc(doc(db, "stores", id));
      
      // Update local state
      set((state: any) => ({
        stores: state.stores.filter((s: Store) => s.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error deleting store:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le magasin",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
});
