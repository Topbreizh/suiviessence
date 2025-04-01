
import { v4 as uuidv4 } from 'uuid';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import type { Vehicle } from '@/types';

export interface VehicleSlice {
  vehicles: Vehicle[];
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<string>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

export const createVehicleSlice = (set: any, get: any) => ({
  vehicles: [],
  
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
      set((state: any) => ({
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
      set((state: any) => ({
        vehicles: state.vehicles.map((v: Vehicle) =>
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
      set((state: any) => ({
        vehicles: state.vehicles.filter((v: Vehicle) => v.id !== id),
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
});
