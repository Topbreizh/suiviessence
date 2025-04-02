
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CalendarIcon, Plus, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GasStation } from "@/types";
import { cn } from "@/lib/utils";
import GasStationMap from "@/components/GasStationMap";

const AddPurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    vehicles, 
    addFuelPurchase,
    fetchVehicles,
    fetchFuelPurchases,
    isLoading: storeIsLoading 
  } = useStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [vehicleId, setVehicleId] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [station, setStation] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: "" });
  const [showMap, setShowMap] = useState(false);
  
  // Récupérer les données à l'initialisation
  useEffect(() => {
    fetchVehicles();
    fetchFuelPurchases();
  }, [fetchVehicles, fetchFuelPurchases]);

  // Calculate total price when quantity or price per liter changes
  useEffect(() => {
    if (quantity && pricePerLiter) {
      const calculatedTotal = (parseFloat(quantity) * parseFloat(pricePerLiter)).toFixed(2);
      setTotalPrice(calculatedTotal);
    }
  }, [quantity, pricePerLiter]);
  
  // Update quantity when total price and price per liter changes
  useEffect(() => {
    if (totalPrice && pricePerLiter && parseFloat(pricePerLiter) > 0) {
      const calculatedQuantity = (parseFloat(totalPrice) / parseFloat(pricePerLiter)).toFixed(2);
      setQuantity(calculatedQuantity);
    }
  }, [totalPrice, pricePerLiter]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !fuelType || !quantity || !pricePerLiter || !totalPrice || !date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newPurchase = {
        date,
        vehicleId,
        fuelType,
        quantity: parseFloat(quantity),
        pricePerLiter: parseFloat(pricePerLiter),
        totalPrice: parseFloat(totalPrice),
        station,
        location: {
          lat: location.lat || 0,
          lng: location.lng || 0,
          address: location.address || ""
        },
        mileage: mileage ? parseFloat(mileage) : undefined,
        notes,
      };
      
      await addFuelPurchase(newPurchase);
      
      toast({
        title: "Succès",
        description: "Achat de carburant ajouté avec succès",
      });
      
      // Actualiser les données après l'ajout
      await fetchFuelPurchases();
      
      navigate("/purchases");
    } catch (error) {
      console.error("Error adding fuel purchase:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'achat de carburant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStationSelect = (station: GasStation) => {
    setStation(station.name);
    setLocation({
      lat: station.location.lat,
      lng: station.location.lng,
      address: station.address
    });
    setShowMap(false);
  };
  
  // Obtenir la position actuelle
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: ""
          });
          setShowMap(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Erreur de localisation",
            description: "Impossible d'obtenir votre position actuelle",
            variant: "destructive",
          });
          // Utiliser une position par défaut (Paris)
          setLocation({
            lat: 48.856614,
            lng: 2.3522219,
            address: ""
          });
          setShowMap(true);
        }
      );
    } else {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
    }
  };
  
  // Gérer l'affichage de la carte
  const toggleMap = () => {
    if (!showMap && !location.lat && !location.lng) {
      getCurrentLocation();
    } else {
      setShowMap(!showMap);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Nouvel Achat</h1>
          <p className="text-muted-foreground">
            Enregistrez un nouvel achat de carburant
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/purchases")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 w-full sm:w-[400px]">
          <TabsTrigger value="basic">Informations de base</TabsTrigger>
          <TabsTrigger value="station">Station & Localisation</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Détails de l'achat</CardTitle>
                <CardDescription>
                  Entrez les informations de base de votre achat de carburant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date picker */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && setDate(newDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Vehicle selection */}
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Véhicule</Label>
                  {vehicles.length > 0 ? (
                    <Select value={vehicleId} onValueChange={setVehicleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un véhicule" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} - {vehicle.licensePlate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-center p-4 border rounded-md">
                      <p className="text-muted-foreground">Aucun véhicule disponible</p>
                      <Button
                        variant="link"
                        className="mt-2 p-0"
                        onClick={() => navigate("/vehicles/add")}
                      >
                        Ajouter un véhicule
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Fuel type */}
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Type de carburant</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de carburant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP95">SP95</SelectItem>
                      <SelectItem value="SP95-E10">SP95-E10</SelectItem>
                      <SelectItem value="SP98">SP98</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="E85">E85</SelectItem>
                      <SelectItem value="GPL">GPL</SelectItem>
                      <SelectItem value="Électricité">Électricité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Price fields */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerLiter">Prix par litre (€)</Label>
                    <Input
                      id="pricePerLiter"
                      type="number"
                      step="0.001"
                      min="0"
                      value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(e.target.value)}
                      placeholder="2.005"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité (L)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="40.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="totalPrice">Prix total (€)</Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalPrice}
                      onChange={(e) => setTotalPrice(e.target.value)}
                      placeholder="80.20"
                    />
                  </div>
                </div>
                
                {/* Mileage */}
                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilométrage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="15000"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="station">
            <Card>
              <CardHeader>
                <CardTitle>Station & Localisation</CardTitle>
                <CardDescription>
                  Indiquez la station-service et sa localisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Station field */}
                <div className="space-y-2">
                  <Label htmlFor="station">Station-service</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="station"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      placeholder="Nom de la station"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={toggleMap}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      {showMap ? "Masquer la carte" : "Trouver"}
                    </Button>
                  </div>
                </div>
                
                {/* Map for selecting a station */}
                {showMap && (
                  <GasStationMap 
                    onStationSelect={handleStationSelect}
                    initialLocation={location.lat && location.lng ? { lat: location.lat, lng: location.lng } : undefined}
                  />
                )}
                
                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes additionnelles"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchases")}
              className="mr-2"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};

export default AddPurchase;
