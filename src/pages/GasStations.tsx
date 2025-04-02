
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Fuel, Search, Trash2, Edit, MapPin, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import type { GasStation } from '@/types';

const GasStations = () => {
  const { gasStations, fetchGasStations, addGasStation, updateGasStation, deleteGasStation } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const { toast } = useToast();
  
  // For the gas station form
  const [isEditing, setIsEditing] = useState(false);
  const [stationId, setStationId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRegular, setPriceRegular] = useState('');
  const [pricePremium, setPricePremium] = useState('');
  const [priceDiesel, setPriceDiesel] = useState('');
  const [notes, setNotes] = useState('');
  
  // Fetch gas stations on component mount
  useEffect(() => {
    fetchGasStations();
  }, [fetchGasStations]);
  
  const filteredStations = gasStations.filter(station => {
    const stationName = station.name.toLowerCase();
    const stationAddress = station.address.toLowerCase();
    const stationBrand = station.brand?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return stationName.includes(query) || stationAddress.includes(query) || stationBrand.includes(query);
  });
  
  const resetForm = () => {
    setStationId(null);
    setName('');
    setAddress('');
    setBrand('');
    setPriceRegular('');
    setPricePremium('');
    setPriceDiesel('');
    setNotes('');
    setIsEditing(false);
  };
  
  const handleEditClick = (station: GasStation) => {
    setStationId(station.id);
    setName(station.name);
    setAddress(station.address);
    setBrand(station.brand || '');
    setPriceRegular(station.priceRegular?.toString() || '');
    setPricePremium(station.pricePremium?.toString() || '');
    setPriceDiesel(station.priceDiesel?.toString() || '');
    setNotes(station.notes || '');
    setIsEditing(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const stationData = {
      name,
      address,
      location: {
        lat: 0, // Placeholder values, would be updated with actual GPS coordinates
        lng: 0,
      },
      brand: brand || undefined,
      priceRegular: priceRegular ? parseFloat(priceRegular) : undefined,
      pricePremium: pricePremium ? parseFloat(pricePremium) : undefined,
      priceDiesel: priceDiesel ? parseFloat(priceDiesel) : undefined,
      lastUpdated: new Date(),
      notes: notes || undefined,
    };
    
    try {
      if (isEditing && stationId) {
        await updateGasStation(stationId, stationData);
        toast({
          title: "Station mise à jour",
          description: "La station-service a été mise à jour avec succès",
        });
      } else {
        await addGasStation(stationData);
        toast({
          title: "Station ajoutée",
          description: "La station-service a été ajoutée avec succès",
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving gas station:", error);
    }
  };
  
  const handleDelete = async () => {
    if (selectedStation) {
      try {
        await deleteGasStation(selectedStation);
        toast({
          title: "Station supprimée",
          description: "La station-service a été supprimée avec succès",
        });
        setSelectedStation(null);
      } catch (error) {
        console.error("Error deleting gas station:", error);
      }
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stations-Service</h1>
          <p className="text-muted-foreground">Gérez vos stations-service préférées</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une station..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog onOpenChange={(open) => !open && resetForm()}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Fuel className="mr-2 h-4 w-4" />
                Nouvelle Station
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Modifier la station-service" : "Ajouter une station-service"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Modifiez les informations de la station-service"
                    : "Ajoutez une nouvelle station-service à votre liste"}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la Station</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Esso Express"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: 123 Rue de Paris, 75001 Paris"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Total, Shell, BP"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceRegular">Prix SP95/98</Label>
                    <Input
                      id="priceRegular"
                      type="number"
                      step="0.001"
                      min="0"
                      value={priceRegular}
                      onChange={(e) => setPriceRegular(e.target.value)}
                      placeholder="€/L"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pricePremium">Prix Premium</Label>
                    <Input
                      id="pricePremium"
                      type="number"
                      step="0.001"
                      min="0"
                      value={pricePremium}
                      onChange={(e) => setPricePremium(e.target.value)}
                      placeholder="€/L"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priceDiesel">Prix Diesel</Label>
                    <Input
                      id="priceDiesel"
                      type="number"
                      step="0.001"
                      min="0"
                      value={priceDiesel}
                      onChange={(e) => setPriceDiesel(e.target.value)}
                      placeholder="€/L"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes supplémentaires"
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button type="submit">{isEditing ? "Mettre à jour" : "Ajouter"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Toutes les Stations</CardTitle>
          <CardDescription>
            {filteredStations.length} stations-service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStations.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Marque</TableHead>
                    <TableHead className="text-right">SP95/98</TableHead>
                    <TableHead className="text-right">Diesel</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStations.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell className="font-medium">{station.name}</TableCell>
                      <TableCell>{station.address}</TableCell>
                      <TableCell>{station.brand || "-"}</TableCell>
                      <TableCell className="text-right">{station.priceRegular ? `${station.priceRegular.toFixed(3)} €` : "-"}</TableCell>
                      <TableCell className="text-right">{station.priceDiesel ? `${station.priceDiesel.toFixed(3)} €` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MapPin className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(station)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setSelectedStation(station.id)}
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
                <Fuel className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Aucune station</h3>
              <p className="text-muted-foreground text-center mt-1">
                {gasStations.length > 0 
                  ? "Aucune station ne correspond à votre recherche" 
                  : "Vous n'avez pas encore enregistré de station-service"}
              </p>
              {gasStations.length === 0 && (
                <Dialog onOpenChange={(open) => !open && resetForm()}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Fuel className="mr-2 h-4 w-4" />
                      Ajouter une station
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {/* Form will be injected here */}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedStation} onOpenChange={(open) => !open && setSelectedStation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette station-service sera définitivement supprimée.
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

export default GasStations;
