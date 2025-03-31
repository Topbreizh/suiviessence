
import { FuelPurchase, Vehicle } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car } from 'lucide-react';

interface VehicleStatsProps {
  purchases: FuelPurchase[];
  vehicles: Vehicle[];
}

const VehicleStats = ({ purchases, vehicles }: VehicleStatsProps) => {
  // Calculate stats for each vehicle
  const vehicleStats = vehicles.map(vehicle => {
    const vehiclePurchases = purchases.filter(p => p.vehicleId === vehicle.id);
    
    const totalLiters = vehiclePurchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalSpent = vehiclePurchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const averagePrice = totalLiters > 0 ? totalSpent / totalLiters : 0;
    
    // Calculate consumption between purchases
    let totalConsumption = 0;
    let consumptionPoints = 0;
    
    if (vehiclePurchases.length >= 2) {
      const sortedPurchases = [...vehiclePurchases].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      for (let i = 1; i < sortedPurchases.length; i++) {
        const prev = sortedPurchases[i - 1];
        const curr = sortedPurchases[i];
        
        if (curr.mileage > prev.mileage) {
          const distance = curr.mileage - prev.mileage;
          const consumption = (curr.quantity / distance) * 100; // L/100km
          
          if (consumption > 0 && consumption < 30) { // Filter out unrealistic values
            totalConsumption += consumption;
            consumptionPoints++;
          }
        }
      }
    }
    
    const averageConsumption = consumptionPoints > 0 ? totalConsumption / consumptionPoints : vehicle.averageConsumption || 0;
    
    return {
      id: vehicle.id,
      name: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      totalLiters,
      totalSpent,
      averagePrice,
      averageConsumption,
      fillCount: vehiclePurchases.length
    };
  });
  
  // Find max values for progress bars
  const maxSpent = Math.max(...vehicleStats.map(v => v.totalSpent), 0);

  if (vehicleStats.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Car className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>Aucun véhicule enregistré</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Véhicule</TableHead>
            <TableHead className="text-right">Pleins</TableHead>
            <TableHead className="text-right">Consommation</TableHead>
            <TableHead className="text-right">Prix Moyen</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicleStats.map((stat) => (
            <TableRow key={stat.id}>
              <TableCell className="font-medium">
                <div>{stat.name}</div>
                <div className="text-xs text-muted-foreground">{stat.make} {stat.model}</div>
              </TableCell>
              <TableCell className="text-right">{stat.fillCount}</TableCell>
              <TableCell className="text-right">
                {stat.averageConsumption > 0 
                  ? `${stat.averageConsumption.toFixed(1)} L/100km` 
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                {stat.averagePrice > 0 
                  ? `${stat.averagePrice.toFixed(3)} €/L` 
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={maxSpent > 0 ? (stat.totalSpent / maxSpent) * 100 : 0} 
                    className="h-2" 
                  />
                  <span className="text-sm font-medium">
                    {stat.totalSpent.toFixed(2)} €
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VehicleStats;
