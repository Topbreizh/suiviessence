
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FuelPurchase, Vehicle, PaymentMethod, FuelType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

interface StoreState {
  fuelPurchases: FuelPurchase[];
  vehicles: Vehicle[];
  addFuelPurchase: (purchase: Omit<FuelPurchase, 'id'>) => Promise<string>;
  updateFuelPurchase: (id: string, purchase: Partial<FuelPurchase>) => Promise<void>;
  deleteFuelPurchase: (id: string) => Promise<void>;
  fetchFuelPurchases: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => string;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      fuelPurchases: [],
      vehicles: [],
      
      fetchFuelPurchases: async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'purchases'));
          const purchases: FuelPurchase[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Convert Firestore timestamp to JavaScript Date
            const purchaseDate = data.date ? new Date(data.date.seconds * 1000) : new Date();
            
            purchases.push({
              ...data,
              id: doc.id,
              date: purchaseDate,
            } as FuelPurchase);
          });
          
          set({ fuelPurchases: purchases });
        } catch (error) {
          console.error('Error fetching purchases:', error);
        }
      },
      
      addFuelPurchase: async (purchase) => {
        try {
          // Add to Firestore
          const docRef = await addDoc(collection(db, 'purchases'), purchase);
          
          // Update local state
          const id = docRef.id;
          set((state) => ({
            fuelPurchases: [...state.fuelPurchases, { ...purchase, id }],
          }));
          
          return id;
        } catch (error) {
          console.error('Error adding purchase:', error);
          throw error;
        }
      },
      
      updateFuelPurchase: async (id, purchase) => {
        try {
          // Update in Firestore
          const purchaseRef = doc(db, 'purchases', id);
          await updateDoc(purchaseRef, purchase);
          
          // Update local state
          set((state) => ({
            fuelPurchases: state.fuelPurchases.map((p) =>
              p.id === id ? { ...p, ...purchase } : p
            ),
          }));
        } catch (error) {
          console.error('Error updating purchase:', error);
          throw error;
        }
      },
      
      deleteFuelPurchase: async (id) => {
        try {
          // Delete from Firestore
          await deleteDoc(doc(db, 'purchases', id));
          
          // Update local state
          set((state) => ({
            fuelPurchases: state.fuelPurchases.filter((p) => p.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting purchase:', error);
          throw error;
        }
      },
      
      addVehicle: (vehicle) => {
        const id = uuidv4();
        set((state) => ({
          vehicles: [...state.vehicles, { ...vehicle, id }],
        }));
        return id;
      },
      
      updateVehicle: (id, vehicle) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...vehicle } : v
          ),
        }));
      },
      
      deleteVehicle: (id) => {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        }));
      },
    }),
    {
      name: 'gestion-essence-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
