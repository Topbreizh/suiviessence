
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
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
  findNearbyStations: (lat: number, lng: number, radius: number) => Promise<GasStation[]>;
}

export const createGasStationSlice = (set: any, get: any) => ({
  gasStations: [],
  
  // Fetch all gas stations from Firestore
  fetchGasStations: async () => {
    set({ isLoading: true });
    try {
      const querySnapshot = await getDocs(collection(db, "gasStations"));
      
      const stations: GasStation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stations.push({
          ...data,
          id: doc.id,
          lastUpdated: data.lastUpdated?.toDate()
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
      // Add the station to Firestore
      const docRef = await addDoc(collection(db, "gasStations"), {
        ...station,
        lastUpdated: new Date()
      });
      
      // Update local state
      const newStation = {
        ...station,
        id: docRef.id,
        lastUpdated: new Date()
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
      await updateDoc(stationRef, {
        ...station,
        lastUpdated: new Date()
      });
      
      // Update local state
      set((state: any) => ({
        gasStations: state.gasStations.map((s: GasStation) =>
          s.id === id ? { ...s, ...station, lastUpdated: new Date() } : s
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
  
  // Find nearby stations (simple implementation - would be better with geospatial queries)
  findNearbyStations: async (lat, lng, radius) => {
    // Calcul de distance simple - une requête Firestore plus avancée serait préférable
    // pour de grandes quantités de données
    const { gasStations } = get();
    return gasStations.filter((station: GasStation) => {
      const distance = calculateDistance(
        lat, 
        lng, 
        station.location.lat, 
        station.location.lng
      );
      return distance <= radius;
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
