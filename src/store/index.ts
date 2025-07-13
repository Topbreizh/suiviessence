
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FuelPurchase, Vehicle, GasStation, ChargingStation, ElectricCharge } from '@/types';
import { createVehicleSlice, type VehicleSlice } from './vehicleStore';
import { createFuelPurchaseSlice, type FuelPurchaseSlice } from './fuelPurchaseStore';
import { createGasStationSlice, type GasStationSlice } from './gasStationStore';
import { createChargingStationSlice, type ChargingStationSlice } from './chargingStationStore';
import { createElectricChargeSlice, type ElectricChargeSlice } from './electricChargeStore';

interface StoreState extends VehicleSlice, FuelPurchaseSlice, GasStationSlice, ChargingStationSlice, ElectricChargeSlice {
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
      
      // Include charging station slice
      ...createChargingStationSlice(set, get),
      
      // Include electric charge slice
      ...createElectricChargeSlice(set, get),
    }),
    {
      name: 'gasoline-guru-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
