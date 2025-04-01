import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FuelPurchase, Vehicle, PaymentMethod, FuelType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  setDoc 
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

interface StoreState {
  fuelPurchases: FuelPurchase[];
  vehicles: Vehicle[];
  addFuelPurchase: (purchase: Omit<FuelPurchase, 'id'>) => Promise<string>;
  updateFuelPurchase: (id: string, purchase: Partial<FuelPurchase>) => Promise<void>;
  deleteFuelPurchase: (id: string) => Promise<void>;
  fetchFuelPurchases: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  fetchVehicles: () => Promise<void>;
  isLoading: boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      fuelPurchases: [],
      vehicles: [],
      isLoading: false,
      
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
          
          set((state) => ({
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
          set((state) => ({
            fuelPurchases: state.fuelPurchases.map((p) =>
              p.id === id ? { ...p, ...purchase } : p
            ),
            isLoading: false
          }));
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
          set((state) => ({
            fuelPurchases: state.fuelPurchases.filter((p) => p.id !== id),
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
      
      // Fetch all vehicles from Firestore
      fetchVehicles: async () => {
        set({ isLoading: true });
        try {
          const querySnapshot = await getDocs(collection(db, "vehicles"));
          
          const vehicles: Vehicle[] = [];
          querySnapshot.forEach((doc) => {
            vehicles.push({
              ...doc.data(),
              id: doc.id
            } as Vehicle);
          });
          
          set({ vehicles, isLoading: false });
        } catch (error) {
          console.error("Error fetching vehicles:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les véhicules",
            variant: "destructive"
          });
          set({ isLoading: false });
        }
      },
      
      // Add a vehicle to Firestore
      addVehicle: async (vehicle) => {
        set({ isLoading: true });
        try {
          const id = uuidv4();
          
          // Create a clean vehicle object without undefined values
          const vehicleData: Record<string, any> = {
            ...vehicle,
            id
          };
          
          // Remove undefined values before sending to Firestore
          Object.keys(vehicleData).forEach(key => {
            if (vehicleData[key] === undefined) {
              delete vehicleData[key];
            }
          });
          
          // Use setDoc with a specific ID instead of addDoc
          await setDoc(doc(db, "vehicles", id), vehicleData);
          
          // Update local state
          set((state) => ({
            vehicles: [...state.vehicles, vehicleData as Vehicle],
            isLoading: false
          }));
          
          return id;
        } catch (error) {
          console.error("Error adding vehicle:", error);
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter le véhicule",
            variant: "destructive"
          });
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Update a vehicle in Firestore
      updateVehicle: async (id, vehicle) => {
        set({ isLoading: true });
        try {
          const vehicleRef = doc(db, "vehicles", id);
          await updateDoc(vehicleRef, vehicle);
          
          // Update local state
          set((state) => ({
            vehicles: state.vehicles.map((v) =>
              v.id === id ? { ...v, ...vehicle } : v
            ),
            isLoading: false
          }));
        } catch (error) {
          console.error("Error updating vehicle:", error);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le véhicule",
            variant: "destructive"
          });
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Delete a vehicle from Firestore
      deleteVehicle: async (id) => {
        set({ isLoading: true });
        try {
          await deleteDoc(doc(db, "vehicles", id));
          
          // Update local state
          set((state) => ({
            vehicles: state.vehicles.filter((v) => v.id !== id),
            isLoading: false
          }));
        } catch (error) {
          console.error("Error deleting vehicle:", error);
          toast({
            title: "Erreur",
            description: "Impossible de supprimer le véhicule",
            variant: "destructive"
          });
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'gasoline-guru-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
