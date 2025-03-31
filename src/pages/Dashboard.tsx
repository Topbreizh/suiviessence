
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Fuel, Car, TrendingUp, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import RecentPurchases from '@/components/dashboard/RecentPurchases';
import FuelPriceChart from '@/components/dashboard/FuelPriceChart';
import SpendingOverview from '@/components/dashboard/SpendingOverview';
import VehicleStats from '@/components/dashboard/VehicleStats';

const Dashboard = () => {
  const { fuelPurchases, vehicles } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    // Show welcome message on first visit
    const hasVisited = localStorage.getItem('gasoline-guru-visited');
    if (!hasVisited) {
      toast({
        title: "Bienvenue sur Gasoline Guru !",
        description: "Commencez par ajouter un véhicule et enregistrer vos pleins d'essence.",
        duration: 5000,
      });
      localStorage.setItem('gasoline-guru-visited', 'true');
    }
  }, [toast]);

  const totalSpent = fuelPurchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
  const totalLiters = fuelPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const averagePrice = totalLiters > 0 ? totalSpent / totalLiters : 0;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const thisMonthPurchases = fuelPurchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    return purchaseDate.getMonth() === thisMonth && purchaseDate.getFullYear() === thisYear;
  });
  
  const monthlySpent = thisMonthPurchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Aperçu de vos achats de carburant et véhicules</p>
        </div>
        {vehicles.length > 0 ? (
          <Button asChild size="sm" className="mt-4 md:mt-0">
            <Link to="/purchases/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvel Achat
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="mt-4 md:mt-0">
            <Link to="/vehicles/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un Véhicule
            </Link>
          </Button>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              {totalLiters.toFixed(2)} litres au total
            </p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dépenses du Mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlySpent.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthPurchases.length} pleins ce mois-ci
            </p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prix Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePrice.toFixed(3)} €/L</div>
            <p className="text-xs text-muted-foreground">
              {fuelPurchases.length} achats enregistrés
            </p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.length > 0 ? "Véhicules enregistrés" : "Aucun véhicule"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      {vehicles.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Commencez avec Gasoline Guru</CardTitle>
            <CardDescription>
              Ajoutez votre premier véhicule pour commencer à suivre vos achats de carburant
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <Button asChild>
              <Link to="/vehicles/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un Véhicule
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : fuelPurchases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Enregistrez votre premier achat</CardTitle>
            <CardDescription>
              Ajoutez des achats de carburant pour commencer à suivre vos dépenses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Fuel className="h-16 w-16 text-muted-foreground mb-4" />
            <Button asChild>
              <Link to="/purchases/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvel Achat
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Évolution des Prix du Carburant</CardTitle>
                <CardDescription>Historique des prix au litre</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <FuelPriceChart purchases={fuelPurchases} />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:row-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Achats Récents</CardTitle>
                <CardDescription>{fuelPurchases.length} achats enregistrés</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentPurchases purchases={fuelPurchases} vehicles={vehicles} />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Dépenses par Mois</CardTitle>
                <CardDescription>Total des dépenses par mois</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <SpendingOverview purchases={fuelPurchases} />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Statistiques par Véhicule</CardTitle>
                <CardDescription>Consommation et dépenses</CardDescription>
              </CardHeader>
              <CardContent>
                <VehicleStats purchases={fuelPurchases} vehicles={vehicles} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
