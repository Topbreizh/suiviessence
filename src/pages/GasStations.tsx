
import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { GasStation } from '@/types';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Search, 
  MapPin, 
  Building, 
  Check, 
  X 
} from 'lucide-react';

const GasStations = () => {
  const { gasStations, fetchGasStations, addGasStation, updateGasStation, deleteGasStation, isLoading } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [newStation, setNewStation] = useState<Omit<GasStation, 'id'>>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    company: '',
    fuelTypes: [],
    isActive: true
  });
  
  useEffect(() => {
    fetchGasStations();
  }, [fetchGasStations]);
  
  // Handle search
  const filteredStations = gasStations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset form for new station
  const resetForm = () => {
    setNewStation({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      company: '',
      fuelTypes: [],
      isActive: true
    });
    setSelectedStation(null);
  };
  
  // Prepare form for edit
  const handleEditClick = (station: GasStation) => {
    setSelectedStation(station);
    setNewStation({
      name: station.name,
      address: station.address,
      city: station.city,
      postalCode: station.postalCode,
      company: station.company || '',
      fuelTypes: station.fuelTypes || [],
      isActive: station.isActive,
      latitude: station.latitude,
      longitude: station.longitude,
      notes: station.notes
    });
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!newStation.name || !newStation.address || !newStation.city || !newStation.postalCode) {
      toast({
        title: "Erreur de formulaire",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (selectedStation) {
        // Update existing station
        await updateGasStation(selectedStation.id, newStation);
        toast({
          title: "Station mise à jour",
          description: `${newStation.name} a été mise à jour avec succès.`
        });
      } else {
        // Add new station
        await addGasStation(newStation);
        toast({
          title: "Station ajoutée",
          description: `${newStation.name} a été ajoutée avec succès.`
        });
      }
      
      // Reset form and close sheet
      resetForm();
      setIsEditSheetOpen(false);
    } catch (error) {
      console.error("Error saving station:", error);
    }
  };
  
  // Handle fuel type checkbox change
  const handleFuelTypeChange = (fuelType: string) => {
    setNewStation(prev => {
      const currentTypes = prev.fuelTypes || [];
      if (currentTypes.includes(fuelType)) {
        // Remove fuel type
        return {
          ...prev,
          fuelTypes: currentTypes.filter(type => type !== fuelType)
        };
      } else {
        // Add fuel type
        return {
          ...prev,
          fuelTypes: [...currentTypes, fuelType]
        };
      }
    });
  };
  
  // Common fuel types
  const commonFuelTypes = ['SP95', 'SP95-E10', 'SP98', 'Diesel', 'E85', 'GPL'];
  
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
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newStation.name}
                    onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                    placeholder="Nom de la station"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Société</Label>
                  <Input
                    id="company"
                    value={newStation.company}
                    onChange={(e) => setNewStation({...newStation, company: e.target.value})}
                    placeholder="Total, BP, Shell, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-right">
                    Adresse <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={newStation.address}
                    onChange={(e) => setNewStation({...newStation, address: e.target.value})}
                    placeholder="123 rue de Paris"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-right">
                      Ville <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={newStation.city}
                      onChange={(e) => setNewStation({...newStation, city: e.target.value})}
                      placeholder="Paris"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-right">
                      Code Postal <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      value={newStation.postalCode}
                      onChange={(e) => setNewStation({...newStation, postalCode: e.target.value})}
                      placeholder="75001"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Types de carburant disponibles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonFuelTypes.map(fuelType => (
                      <div key={fuelType} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`fuel-${fuelType}`} 
                          checked={newStation.fuelTypes?.includes(fuelType) || false}
                          onCheckedChange={() => handleFuelTypeChange(fuelType)}
                        />
                        <label 
                          htmlFor={`fuel-${fuelType}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {fuelType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newStation.notes || ''}
                    onChange={(e) => setNewStation({...newStation, notes: e.target.value})}
                    placeholder="Notes additionnelles"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox 
                    id="active" 
                    checked={newStation.isActive}
                    onCheckedChange={(checked) => 
                      setNewStation({...newStation, isActive: checked as boolean})}
                  />
                  <label 
                    htmlFor="active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Station active
                  </label>
                </div>
                
                <DialogFooter className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setIsEditSheetOpen(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {selectedStation ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      ) : filteredStations.length === 0 ? (
        <Card className="w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">Aucune station trouvée</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Aucune station ne correspond à votre recherche." 
                : "Vous n'avez pas encore ajouté de stations. Commencez par en ajouter une !"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Effacer la recherche
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Types de carburant</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">
                      {station.company ? (
                        <div>
                          <div>{station.name}</div>
                          <div className="text-xs text-muted-foreground">{station.company}</div>
                        </div>
                      ) : (
                        station.name
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start">
                        <MapPin className="mr-1 h-3 w-3 translate-y-1 text-muted-foreground" />
                        <div>
                          <div>{station.address}</div>
                          <div className="text-xs text-muted-foreground">
                            {station.postalCode} {station.city}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {station.fuelTypes?.length > 0 ? (
                          station.fuelTypes.map((type) => (
                            <span key={type} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {type}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Non spécifié</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {station.isActive ? (
                        <span className="flex items-center text-green-600">
                          <Check className="mr-1 h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <X className="mr-1 h-4 w-4" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(station)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(station)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
          
          {selectedStation && (
            <div className="p-4 border rounded-md space-y-2">
              <div className="font-medium">{selectedStation.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedStation.address}, {selectedStation.city}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GasStations;
