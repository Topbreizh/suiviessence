
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
import type { GasStation } from '@/types';

export interface GasStationSlice {
  gasStations: GasStation[];
  fetchGasStations: () => Promise<void>;
  addGasStation: (station: Omit<GasStation, 'id'>) => Promise<string>;
  updateGasStation: (id: string, station: Partial<GasStation>) => Promise<void>;
  deleteGasStation: (id: string) => Promise<void>;
}

export const createGasStationSlice = (set: any, get: any) => ({
  gasStations: [],
  
  // Fetch all gas stations from Firestore
  fetchGasStations: async () => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "gasStations"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      
      const stations: GasStation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stations.push({
          ...data,
          id: doc.id,
          // Convert Firestore Timestamp to Date if lastUpdated exists
          lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : undefined,
        } as GasStation);
      });
      
      set({ gasStations: stations, isLoading: false });
    } catch (error) {
      console.error("Error fetching gas stations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les stations-service",
        variant: "destructive"
      });
      set({ isLoading: false });
    }
  },
  
  // Add a gas station to Firestore
  addGasStation: async (station) => {
    set({ isLoading: true });
    try {
      const docRef = await addDoc(collection(db, "gasStations"), station);
      
      // Update local state with the new station
      const newStation = {
        ...station,
        id: docRef.id
      };
      
      set((state: any) => ({
        gasStations: [...state.gasStations, newStation],
        isLoading: false
      }));
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding gas station:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la station-service",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Update a gas station in Firestore
  updateGasStation: async (id, station) => {
    set({ isLoading: true });
    try {
      const stationRef = doc(db, "gasStations", id);
      await updateDoc(stationRef, station);
      
      // Update local state
      set((state: any) => ({
        gasStations: state.gasStations.map((s: GasStation) =>
          s.id === id ? { ...s, ...station } : s
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error updating gas station:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la station-service",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
  
  // Delete a gas station from Firestore
  deleteGasStation: async (id) => {
    set({ isLoading: true });
    try {
      await deleteDoc(doc(db, "gasStations", id));
      
      // Update local state
      set((state: any) => ({
        gasStations: state.gasStations.filter((s: GasStation) => s.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error deleting gas station:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la station-service",
        variant: "destructive"
      });
      set({ isLoading: false });
      throw error;
    }
  },
});
