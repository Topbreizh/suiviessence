import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Trash2, Edit, Car, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const Vehicles = () => {
  const { vehicles, deleteVehicle, fuelPurchases, fetchVehicles } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      vehicle.name.toLowerCase().includes(query) ||
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query)
    );
  });

  const getVehicleFuelType = (type: string) => {
    switch (type) {
      case 'gasoline':
        return 'Essence';
      case 'diesel':
        return 'Diesel';
      case 'electric':
        return 'Électrique';
      case 'hybrid':
        return 'Hybride';
      case 'lpg':
        return 'GPL';
      default:
        return 'Autre';
    }
  };

  const getPurchaseCount = (vehicleId: string) => {
    return fuelPurchases.filter(purchase => purchase.vehicleId === vehicleId).length;
  };

  const handleDelete = async () => {
    if (selectedVehicle) {
      // Check if vehicle has associated purchases
      const purchaseCount = getPurchaseCount(selectedVehicle);
      if (purchaseCount > 0) {
        toast({
          title: "Suppression impossible",
          description: `Ce véhicule est associé à ${purchaseCount} achats de carburant. Veuillez d'abord supprimer ces achats.`,
          variant: "destructive",
        });
        setSelectedVehicle(null);
        return;
      }

      setIsDeleting(true);
      try {
        await deleteVehicle(selectedVehicle);
        toast({
          title: "Véhicule supprimé",
          description: "Le véhicule a été supprimé avec succès",
        });
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression du véhicule",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setSelectedVehicle(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Véhicules</h1>
          <p className="text-muted-foreground">Gérez vos véhicules</p>
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
        <Button asChild className="w-full sm:w-auto">
          <Link to="/vehicles/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un Véhicule
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{vehicle.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/vehicles/edit/${vehicle.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => setSelectedVehicle(vehicle.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Immatriculation:</div>
                    <div className="font-semibold">{vehicle.licensePlate}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Type de carburant:</div>
                    <Badge variant="outline">
                      {getVehicleFuelType(vehicle.fuelType)}
                    </Badge>
                  </div>
                  {vehicle.averageConsumption && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Consommation moyenne:</div>
                      <div>{vehicle.averageConsumption} L/100km</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Pleins enregistrés:</div>
                    <div>{getPurchaseCount(vehicle.id)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Car className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Aucun véhicule</h3>
                <p className="text-muted-foreground text-center mt-1">
                  {vehicles.length > 0 
                    ? "Aucun véhicule ne correspond à votre recherche" 
                    : "Vous n'avez pas encore ajouté de véhicule"}
                </p>
                {vehicles.length === 0 && (
                  <Button asChild className="mt-4">
                    <Link to="/vehicles/add">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter un véhicule
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AlertDialog open={!!selectedVehicle} onOpenChange={(open) => !open && setSelectedVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Ce véhicule sera définitivement supprimé.
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
    </div>
  );
};

export default Vehicles;
