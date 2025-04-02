
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import type { Store } from '@/types';

export interface StoreSlice {
  stores: Store[];
  isLoadingStores: boolean;
  fetchStores: () => Promise<void>;
  addStore: (store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStore: (id: string, store: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
}

export const createStoreSlice = (set: any, get: any) => ({
  stores: [],
  isLoadingStores: false,
  
  // Fetch all stores
  fetchStores: async () => {
    set({ isLoadingStores: true });
    try {
      const q = query(collection(db, "stores"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      
      const stores: Store[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stores.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Ensure location is properly structured
          location: data.location ? {
            lat: data.location.lat || 0,
            lng: data.location.lng || 0
          } : undefined
        } as Store);
      });
      
      set({ stores, isLoadingStores: false });
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les magasins",
        variant: "destructive"
      });
      set({ isLoadingStores: false });
    }
  },
  
  // Add a store
  addStore: async (store) => {
    set({ isLoadingStores: true });
    try {
      // Add timestamps
      const storeData = {
        ...store,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, "stores"), storeData);
      
      // Update local state
      const newStore = {
        ...store,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set((state: any) => ({
        stores: [...state.stores, newStore],
        isLoadingStores: false
      }));
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding store:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le magasin",
        variant: "destructive"
      });
      set({ isLoadingStores: false });
      throw error;
    }
  },
  
  // Update a store
  updateStore: async (id, store) => {
    set({ isLoadingStores: true });
    try {
      const storeRef = doc(db, "stores", id);
      
      // Add updated timestamp
      const updateData = {
        ...store,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(storeRef, updateData);
      
      // Update local state
      set((state: any) => {
        const updatedStores = state.stores.map((s: Store) => {
          if (s.id === id) {
            return {
              ...s,
              ...store,
              updatedAt: new Date()
            };
          }
          return s;
        });
        
        return {
          stores: updatedStores,
          isLoadingStores: false
        };
      });
      
    } catch (error) {
      console.error("Error updating store:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le magasin",
        variant: "destructive"
      });
      set({ isLoadingStores: false });
      throw error;
    }
  },
  
  // Delete a store
  deleteStore: async (id) => {
    set({ isLoadingStores: true });
    try {
      await deleteDoc(doc(db, "stores", id));
      
      // Update local state
      set((state: any) => ({
        stores: state.stores.filter((s: Store) => s.id !== id),
        isLoadingStores: false
      }));
    } catch (error) {
      console.error("Error deleting store:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le magasin",
        variant: "destructive"
      });
      set({ isLoadingStores: false });
      throw error;
    }
  },
});
