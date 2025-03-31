
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FuelPurchase, Vehicle, PaymentMethod, FuelType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface StoreState {
  fuelPurchases: FuelPurchase[];
  vehicles: Vehicle[];
  addFuelPurchase: (purchase: Omit<FuelPurchase, 'id'>) => string;
  updateFuelPurchase: (id: string, purchase: Partial<FuelPurchase>) => void;
  deleteFuelPurchase: (id: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => string;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      fuelPurchases: [],
      vehicles: [],
      
      addFuelPurchase: (purchase) => {
        const id = uuidv4();
        set((state) => ({
          fuelPurchases: [...state.fuelPurchases, { ...purchase, id }],
        }));
        return id;
      },
      
      updateFuelPurchase: (id, purchase) => {
        set((state) => ({
          fuelPurchases: state.fuelPurchases.map((p) =>
            p.id === id ? { ...p, ...purchase } : p
          ),
        }));
      },
      
      deleteFuelPurchase: (id) => {
        set((state) => ({
          fuelPurchases: state.fuelPurchases.filter((p) => p.id !== id),
        }));
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
      name: 'gasoline-guru-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
