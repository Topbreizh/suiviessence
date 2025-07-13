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
import type { ChargingStation } from '@/types';

export interface ChargingStationSlice {
  chargingStations: ChargingStation[];
  fetchChargingStations: () => Promise<void>;
  addChargingStation: (station: Omit<ChargingStation, 'id'>) => Promise<string>;
  updateChargingStation: (id: string, station: Partial<ChargingStation>) => Promise<void>;
  deleteChargingStation: (id: string) => Promise<void>;
}

export const createChargingStationSlice = (set: any, get: any) => ({
  chargingStations: [],
  
  // Fetch all charging stations from Firestore
  fetchChargingStations: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "chargingStations"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      
      const stations: ChargingStation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stations.push({
          ...data,
          id: doc.id,
        } as ChargingStation);
      });
      
      set({ chargingStations: stations, isLoading: false });
    } catch (error) {
      console.error("Error fetching charging stations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les bornes de recharge",
        variant: "destructive"
      });
      set({ isLoading: false });
    }
  },
  
  // Add a charging station to Firestore
  addChargingStation: async (station) => {
    set({ isLoading: true });
    try {
      const stationData = {
        ...station,
        isActive: true // Set active by default
      };
      
      const docRef = await addDoc(collection(db, "chargingStations"), stationData);
      
      // Update local state with the new station
      const newStation = {
        ...stationData,
        id: docRef.id
      };
      
      set((state: any) => ({
        chargingStations: [...state.chargingStations, newStation],
        isLoading: false
      }));
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding charging station:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la borne de recharge",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Update a charging station in Firestore
  updateChargingStation: async (id, station) => {
    set({ isLoading: true });
    try {
      const stationRef = doc(db, "chargingStations", id);
      await updateDoc(stationRef, station);
      
      // Update local state
      set((state: any) => {
        const updatedStations = state.chargingStations.map((s: ChargingStation) => {
          if (s.id === id) {
            return {
              ...s,
              ...station
            };
          }
          return s;
        });
        
        return {
          chargingStations: updatedStations,
          isLoading: false
        };
      });
    } catch (error) {
      console.error("Error updating charging station:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la borne de recharge",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Delete a charging station from Firestore
  deleteChargingStation: async (id) => {
    set({ isLoading: true });
    try {
      await deleteDoc(doc(db, "chargingStations", id));
      
      // Update local state
      set((state: any) => ({
        chargingStations: state.chargingStations.filter((s: ChargingStation) => s.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error deleting charging station:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la borne de recharge",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
});