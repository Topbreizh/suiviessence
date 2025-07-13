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
import { ChargingStation } from '@/types';
import { Plus, Search, Zap } from 'lucide-react';
import ChargingStationForm from '@/components/charging/ChargingStationForm';
import ChargingStationList from '@/components/charging/ChargingStationList';
import DeleteConfirmation from '@/components/stations/DeleteConfirmation';

const ChargingStations = () => {
  const { chargingStations, fetchChargingStations, addChargingStation, updateChargingStation, deleteChargingStation, isLoading } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchChargingStations();
  }, [fetchChargingStations]);
  
  // Reset form for new station
  const resetForm = () => {
    setSelectedStation(null);
  };
  
  // Prepare form for edit
  const handleEditClick = (station: ChargingStation) => {
    setSelectedStation(station);
    setIsEditSheetOpen(true);
  };
  
  // Handle delete
  const handleDeleteClick = (station: ChargingStation) => {
    setSelectedStation(station);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedStation) return;
    
    try {
      await deleteChargingStation(selectedStation.id);
      toast({
        title: "Borne supprimée",
        description: `${selectedStation.name} a été supprimée avec succès.`
      });
      setIsDeleteDialogOpen(false);
      setSelectedStation(null);
    } catch (error) {
      console.error("Error deleting charging station:", error);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (stationData: Omit<ChargingStation, 'id'>) => {
    try {
      if (selectedStation) {
        // Update existing station
        await updateChargingStation(selectedStation.id, stationData);
        toast({
          title: "Borne mise à jour",
          description: `${stationData.name} a été mise à jour avec succès.`
        });
      } else {
        // Add new station
        await addChargingStation(stationData);
        toast({
          title: "Borne ajoutée",
          description: `${stationData.name} a été ajoutée avec succès.`
        });
      }
      
      // Reset form and close sheet
      resetForm();
      setIsEditSheetOpen(false);
    } catch (error) {
      console.error("Error saving charging station:", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            Bornes de Recharge
          </h1>
          <p className="text-muted-foreground">
            Gérez les bornes de recharge électrique pour vos véhicules
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
                <Plus className="mr-2 h-4 w-4" /> Ajouter une borne
              </Button>
            </DialogTrigger>
            
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {selectedStation ? `Modifier ${selectedStation.name}` : "Nouvelle borne de recharge"}
                </SheetTitle>
                <SheetDescription>
                  {selectedStation 
                    ? "Modifiez les détails de la borne de recharge" 
                    : "Ajoutez une nouvelle borne de recharge à votre liste"}
                </SheetDescription>
              </SheetHeader>
              
              <ChargingStationForm
                initialData={selectedStation ? {
                  name: selectedStation.name,
                  address: selectedStation.address,
                  city: selectedStation.city,
                  postalCode: selectedStation.postalCode,
                  operator: selectedStation.operator || '',
                  connectorTypes: selectedStation.connectorTypes || [],
                  maxPower: selectedStation.maxPower,
                  pricePerKwh: selectedStation.pricePerKwh,
                  numberOfChargers: selectedStation.numberOfChargers,
                  fastCharging: selectedStation.fastCharging,
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
        <ChargingStationList 
          stations={chargingStations}
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
              Êtes-vous sûr de vouloir supprimer cette borne de recharge ?
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

export default ChargingStations;