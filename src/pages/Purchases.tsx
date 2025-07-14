
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Trash2, Edit, Download, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';

const Purchases = () => {
  const { 
    fuelPurchases, 
    electricCharges, 
    vehicles, 
    chargingStations,
    deleteFuelPurchase,
    deleteElectricCharge,
    fetchFuelPurchases,
    fetchElectricCharges,
    fetchVehicles,
    fetchChargingStations
  } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<string | null>(null);
  const [selectedCharge, setSelectedCharge] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all data on component mount
  useEffect(() => {
    fetchFuelPurchases();
    fetchElectricCharges();
    fetchVehicles();
    fetchChargingStations();
  }, []);

  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Véhicule inconnu';
  };

  const getChargingStationName = (id: string) => {
    const station = chargingStations.find(s => s.id === id);
    return station ? station.name : 'Station inconnue';
  };

  // Combine fuel purchases and electric charges into a unified list
  const allPurchases = [
    ...fuelPurchases.map(purchase => ({
      ...purchase,
      type: 'fuel' as const,
      stationDisplayName: purchase.stationName
    })),
    ...electricCharges.map(charge => ({
      ...charge,
      type: 'electric' as const,
      stationDisplayName: charge.stationName
    }))
  ];

  const filteredPurchases = allPurchases.filter(purchase => {
    const vehicleName = getVehicleName(purchase.vehicleId).toLowerCase();
    const stationName = purchase.stationDisplayName.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return vehicleName.includes(query) || stationName.includes(query);
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleDelete = () => {
    if (selectedPurchase) {
      deleteFuelPurchase(selectedPurchase);
      toast({
        title: "Achat supprimé",
        description: "L'achat de carburant a été supprimé avec succès",
      });
      setSelectedPurchase(null);
    }
  };

  const handleDeleteCharge = () => {
    if (selectedCharge) {
      deleteElectricCharge(selectedCharge);
      toast({
        title: "Recharge supprimée",
        description: "La recharge électrique a été supprimée avec succès",
      });
      setSelectedCharge(null);
    }
  };

  const exportToCsv = () => {
    if (allPurchases.length === 0) {
      toast({
        title: "Erreur d'exportation",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    // Prepare CSV data
    const headers = ['Date', 'Type', 'Véhicule', 'Station', 'Quantité/Énergie', 'Prix unitaire', 'Total (€)', 'Détails'];
    
    const rows = sortedPurchases.map(purchase => {
      if (purchase.type === 'fuel') {
        return [
          format(new Date(purchase.date), 'dd/MM/yyyy'),
          'Carburant',
          getVehicleName(purchase.vehicleId),
          purchase.stationDisplayName,
          `${purchase.quantity} L`,
          `${purchase.pricePerLiter} €/L`,
          purchase.totalPrice.toString(),
          `${purchase.mileage} km`
        ];
        } else {
          return [
            format(new Date(purchase.date), 'dd/MM/yyyy'),
            'Électrique',
            getVehicleName(purchase.vehicleId),
            purchase.stationDisplayName,
            `${purchase.energyAmount} kWh`,
            `${purchase.pricePerKwh} €/kWh`,
            purchase.totalPrice.toString(),
            `${purchase.batteryLevelStart || 0}% → ${purchase.batteryLevelEnd || 0}%`
          ];
        }
    });
    
    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `achats-energie-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportation réussie",
      description: "Les données ont été exportées au format CSV",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achats d'Énergie</h1>
          <p className="text-muted-foreground">Gérez tous vos achats de carburant et recharges électriques</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button asChild>
            <Link to="/purchases/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvel Achat
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/electric-charge/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle Recharge
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tous les Achats</CardTitle>
          <CardDescription>
            {filteredPurchases.length} achats d'énergie ({fuelPurchases.length} carburant, {electricCharges.length} électrique)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPurchases.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPurchases.map((purchase) => (
                    <TableRow key={`${purchase.type}-${purchase.id}`}>
                      <TableCell>
                        {format(new Date(purchase.date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.type === 'fuel' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {purchase.type === 'fuel' ? 'Carburant' : 'Électrique'}
                        </span>
                      </TableCell>
                      <TableCell>{getVehicleName(purchase.vehicleId)}</TableCell>
                      <TableCell>{purchase.stationDisplayName}</TableCell>
                      <TableCell className="text-right">
                        {purchase.type === 'fuel' 
                          ? `${purchase.quantity.toFixed(2)} L`
                          : `${purchase.energyAmount.toFixed(2)} kWh`
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {purchase.type === 'fuel' 
                          ? `${purchase.pricePerLiter.toFixed(3)} €/L`
                          : `${purchase.pricePerKwh.toFixed(3)} €/kWh`
                        }
                      </TableCell>
                      <TableCell className="font-medium text-right">{purchase.totalPrice.toFixed(2)} €</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={purchase.type === 'fuel' ? `/purchases/edit/${purchase.id}` : `/electric-charge/edit/${purchase.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (purchase.type === 'fuel') {
                                  setSelectedPurchase(purchase.id);
                                } else {
                                  setSelectedCharge(purchase.id);
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Aucun résultat</h3>
              <p className="text-muted-foreground text-center mt-1">
                {allPurchases.length > 0 
                  ? "Aucun achat ne correspond à votre recherche" 
                  : "Vous n'avez pas encore enregistré d'achat d'énergie"}
              </p>
              {allPurchases.length === 0 && (
                <div className="flex gap-2 mt-4">
                  <Button asChild>
                    <Link to="/purchases/add">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter un achat
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/electric-charge/add">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter une recharge
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedPurchase} onOpenChange={(open) => !open && setSelectedPurchase(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cet achat de carburant sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!selectedCharge} onOpenChange={(open) => !open && setSelectedCharge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette recharge électrique sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCharge}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Purchases;
