
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
import type { FuelPurchase } from '@/types';

export interface FuelPurchaseSlice {
  fuelPurchases: FuelPurchase[];
  fetchFuelPurchases: () => Promise<void>;
  addFuelPurchase: (purchase: Omit<FuelPurchase, 'id'>) => Promise<string>;
  updateFuelPurchase: (id: string, purchase: Partial<FuelPurchase>) => Promise<void>;
  deleteFuelPurchase: (id: string) => Promise<void>;
}

export const createFuelPurchaseSlice = (set: any, get: any) => ({
  fuelPurchases: [],
  
  // Fetch all fuel purchases from Firestore
  fetchFuelPurchases: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "fuelPurchases"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      
      const purchases: FuelPurchase[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        purchases.push({
          ...data,
          id: doc.id,
          date: data.date.toDate(), // Convert Firestore Timestamp to Date
          // Ensure nested objects are properly set
          location: {
            lat: data.location?.lat || 0,
            lng: data.location?.lng || 0,
            address: data.location?.address || ""
          }
        } as FuelPurchase);
      });
      
      set({ fuelPurchases: purchases, isLoading: false });
    } catch (error) {
      console.error("Error fetching fuel purchases:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les achats de carburant",
        variant: "destructive"
      });
      set({ isLoading: false });
    }
  },
  
  // Add a fuel purchase to Firestore
  addFuelPurchase: async (purchase) => {
    set({ isLoading: true });
    try {
      // Convert Date to Firestore Timestamp
      const purchaseData = {
        ...purchase,
        date: Timestamp.fromDate(new Date(purchase.date))
      };
      
      const docRef = await addDoc(collection(db, "fuelPurchases"), purchaseData);
      
      // Update local state with the new purchase
      const newPurchase = {
        ...purchase,
        id: docRef.id
      };
      
      set((state: any) => ({
        fuelPurchases: [newPurchase, ...state.fuelPurchases],
        isLoading: false
      }));
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding fuel purchase:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'achat de carburant",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Update a fuel purchase in Firestore
  updateFuelPurchase: async (id, purchase) => {
    set({ isLoading: true });
    try {
      const purchaseRef = doc(db, "fuelPurchases", id);
      
      // If updating the date, convert it to Firestore Timestamp
      const updateData: any = {...purchase};
      if (purchase.date) {
        updateData.date = Timestamp.fromDate(new Date(purchase.date));
      }
      
      await updateDoc(purchaseRef, updateData);
      
      // Update local state
      set((state: any) => {
        const updatedPurchases = state.fuelPurchases.map((p: FuelPurchase) => {
          if (p.id === id) {
            // Create a proper merged object
            return {
              ...p,
              ...purchase,
              // Ensure date is properly converted back
              date: purchase.date || p.date
            };
          }
          return p;
        });
        
        return {
          fuelPurchases: updatedPurchases,
          isLoading: false
        };
      });
      
      // Fetch data again to ensure everything is in sync
      await get().fetchFuelPurchases();
      
    } catch (error) {
      console.error("Error updating fuel purchase:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'achat de carburant",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Delete a fuel purchase from Firestore
  deleteFuelPurchase: async (id) => {
    set({ isLoading: true });
    try {
      await deleteDoc(doc(db, "fuelPurchases", id));
      
      // Update local state
      set((state: any) => ({
        fuelPurchases: state.fuelPurchases.filter((p: FuelPurchase) => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error deleting fuel purchase:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'achat de carburant",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
});
