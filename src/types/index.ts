
export interface FuelPurchase {
  id: string;
  date: Date;
  quantity: number; // in liters
  pricePerLiter: number;
  totalPrice: number;
  stationName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  vehicleId: string;
  paymentMethod: PaymentMethod;
  mileage: number; // in km
  fuelType: string; // Ajout du type de carburant
  notes?: string;
}

export type PaymentMethod = 'card' | 'cash' | 'app' | 'other';

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  fuelType: FuelType;
  averageConsumption?: number; // L/100km
  tankCapacity?: number; // in liters
  notes?: string;
}

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'other';

export interface MonthlyStats {
  month: string;
  totalSpent: number;
  totalLiters: number;
  averagePrice: number;
}

export interface VehicleStats {
  vehicleId: string;
  vehicleName: string;
  totalSpent: number;
  totalLiters: number;
  averageConsumption: number;
  averagePrice: number;
  fillCount: number;
}

export interface StationStats {
  stationName: string;
  visitCount: number;
  averagePrice: number;
  totalSpent: number;
}

// Ajout de l'interface pour les stations
export interface GasStation {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  company?: string; // Total, BP, etc.
  fuelTypes: string[]; // SP95, SP98, Diesel, etc.
  notes?: string;
  isActive: boolean;
}
