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
import type { ElectricCharge } from '@/types';

export interface ElectricChargeSlice {
  electricCharges: ElectricCharge[];
  fetchElectricCharges: () => Promise<void>;
  addElectricCharge: (charge: Omit<ElectricCharge, 'id'>) => Promise<string>;
  updateElectricCharge: (id: string, charge: Partial<ElectricCharge>) => Promise<void>;
  deleteElectricCharge: (id: string) => Promise<void>;
}

export const createElectricChargeSlice = (set: any, get: any) => ({
  electricCharges: [],
  
  // Fetch all electric charges from Firestore
  fetchElectricCharges: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "electricCharges"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      
      const charges: ElectricCharge[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        charges.push({
          ...data,
          id: doc.id,
          date: data.date.toDate(), // Convert Firestore Timestamp to Date
          // Ensure nested objects are properly set
          location: {
            lat: data.location?.lat || 0,
            lng: data.location?.lng || 0,
            address: data.location?.address || ""
          }
        } as ElectricCharge);
      });
      
      set({ electricCharges: charges, isLoading: false });
    } catch (error) {
      console.error("Error fetching electric charges:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les recharges électriques",
        variant: "destructive"
      });
      set({ isLoading: false });
    }
  },
  
  // Add an electric charge to Firestore
  addElectricCharge: async (charge) => {
    set({ isLoading: true });
    try {
      // Convert Date to Firestore Timestamp
      const chargeData = {
        ...charge,
        date: Timestamp.fromDate(new Date(charge.date))
      };
      
      const docRef = await addDoc(collection(db, "electricCharges"), chargeData);
      
      // Update local state with the new charge
      const newCharge = {
        ...charge,
        id: docRef.id
      };
      
      set((state: any) => ({
        electricCharges: [newCharge, ...state.electricCharges],
        isLoading: false
      }));
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding electric charge:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recharge électrique",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Update an electric charge in Firestore
  updateElectricCharge: async (id, charge) => {
    set({ isLoading: true });
    try {
      const chargeRef = doc(db, "electricCharges", id);
      
      // If updating the date, convert it to Firestore Timestamp
      const updateData: any = {...charge};
      if (charge.date) {
        updateData.date = Timestamp.fromDate(new Date(charge.date));
      }
      
      await updateDoc(chargeRef, updateData);
      
      // Update local state
      set((state: any) => {
        const updatedCharges = state.electricCharges.map((c: ElectricCharge) => {
          if (c.id === id) {
            return {
              ...c,
              ...charge,
              date: charge.date || c.date
            };
          }
          return c;
        });
        
        return {
          electricCharges: updatedCharges,
          isLoading: false
        };
      });
      
      // Fetch data again to ensure everything is in sync
      await get().fetchElectricCharges();
      
    } catch (error) {
      console.error("Error updating electric charge:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la recharge électrique",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Delete an electric charge from Firestore
  deleteElectricCharge: async (id) => {
    set({ isLoading: true });
    try {
      await deleteDoc(doc(db, "electricCharges", id));
      
      // Update local state
      set((state: any) => ({
        electricCharges: state.electricCharges.filter((c: ElectricCharge) => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error deleting electric charge:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la recharge électrique",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
});