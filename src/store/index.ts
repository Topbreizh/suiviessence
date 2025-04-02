
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FuelPurchase, Vehicle } from '@/types';
import { createVehicleSlice, type VehicleSlice } from './vehicleStore';
import { createFuelPurchaseSlice, type FuelPurchaseSlice } from './fuelPurchaseStore';
import { createGasStationSlice, type GasStationSlice } from './gasStationStore';
import { createStoreSlice, type StoreSlice } from './storeStore';

interface StoreState extends VehicleSlice, FuelPurchaseSlice, GasStationSlice, StoreSlice {
  isLoading: boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      
      // Include vehicle slice
      ...createVehicleSlice(set, get),
      
      // Include fuel purchase slice
      ...createFuelPurchaseSlice(set, get),
      
      // Include gas station slice
      ...createGasStationSlice(set, get),
      
      // Include store slice
      ...createStoreSlice(set, get),
    }),
    {
      name: 'gasoline-guru-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
