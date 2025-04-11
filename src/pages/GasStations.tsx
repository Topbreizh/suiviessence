
import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { GasStation } from '@/types';
import { Plus, Search } from 'lucide-react';
import StationForm from '@/components/stations/StationForm';
import StationList from '@/components/stations/StationList';
import DeleteConfirmation from '@/components/stations/DeleteConfirmation';

const GasStations = () => {
  const { gasStations, fetchGasStations, addGasStation, updateGasStation, deleteGasStation, isLoading } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchGasStations();
  }, [fetchGasStations]);
  
  // Reset form for new station
  const resetForm = () => {
    setSelectedStation(null);
  };
  
  // Prepare form for edit
  const handleEditClick = (station: GasStation) => {
    setSelectedStation(station);
    setIsEditSheetOpen(true);
  };
  
  // Handle delete
  const handleDeleteClick = (station: GasStation) => {
    setSelectedStation(station);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedStation) return;
    
    try {
      await deleteGasStation(selectedStation.id);
      toast({
        title: "Station supprimée",
        description: `${selectedStation.name} a été supprimée avec succès.`
      });
      setIsDeleteDialogOpen(false);
      setSelectedStation(null);
    } catch (error) {
      console.error("Error deleting station:", error);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (stationData: Omit<GasStation, 'id'>) => {
    try {
      if (selectedStation) {
        // Update existing station
        await updateGasStation(selectedStation.id, stationData);
        toast({
          title: "Station mise à jour",
          description: `${stationData.name} a été mise à jour avec succès.`
        });
      } else {
        // Add new station
        await addGasStation(stationData);
        toast({
          title: "Station ajoutée",
          description: `${stationData.name} a été ajoutée avec succès.`
        });
      }
      
      // Reset form and close sheet
      resetForm();
      setIsEditSheetOpen(false);
    } catch (error) {
      console.error("Error saving station:", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stations-service</h1>
          <p className="text-muted-foreground">
            Gérez les stations d'essence pour vos achats de carburant
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 w-full md:w-[200px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsEditSheetOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Ajouter une station
              </Button>
            </DialogTrigger>
            
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {selectedStation ? `Modifier ${selectedStation.name}` : "Nouvelle station-service"}
                </SheetTitle>
                <SheetDescription>
                  {selectedStation 
                    ? "Modifiez les détails de la station-service" 
                    : "Ajoutez une nouvelle station-service à votre liste"}
                </SheetDescription>
              </SheetHeader>
              
              <StationForm
                initialData={selectedStation ? {
                  name: selectedStation.name,
                  address: selectedStation.address,
                  city: selectedStation.city,
                  postalCode: selectedStation.postalCode,
                  company: selectedStation.company || '',
                  fuelTypes: selectedStation.fuelTypes || [],
                  isActive: selectedStation.isActive,
                  latitude: selectedStation.latitude,
                  longitude: selectedStation.longitude,
                  notes: selectedStation.notes
                } : null}
                onSubmit={handleSubmit}
                onCancel={() => {
                  resetForm();
                  setIsEditSheetOpen(false);
                }}
                isLoading={isLoading}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      ) : (
        <StationList 
          stations={gasStations}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette station-service ?
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <DeleteConfirmation 
            station={selectedStation}
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GasStations;
