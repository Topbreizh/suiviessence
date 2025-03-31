
import { FuelPurchase, Vehicle } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Fuel, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface RecentPurchasesProps {
  purchases: FuelPurchase[];
  vehicles: Vehicle[];
}

const RecentPurchases = ({ purchases, vehicles }: RecentPurchasesProps) => {
  // Get the 6 most recent purchases
  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Function to get vehicle name by id
  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Véhicule inconnu';
  };

  if (recentPurchases.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Fuel className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>Aucun achat enregistré</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentPurchases.map((purchase) => (
        <Link to="/purchases" key={purchase.id}>
          <Card className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Fuel className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">{getVehicleName(purchase.vehicleId)}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(purchase.date), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{purchase.totalPrice.toFixed(2)} €</p>
                <p className="text-xs text-muted-foreground">{purchase.quantity.toFixed(2)} L</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default RecentPurchases;
