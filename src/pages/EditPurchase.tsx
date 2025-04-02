
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarIcon, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FuelPurchase } from "@/types";
import { cn } from "@/lib/utils";

const EditPurchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fuelPurchases, vehicles, updateFuelPurchase, fetchFuelPurchases } = useStore();
  
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
  
  // Récupérer les données à l'initialisation
  useEffect(() => {
    fetchFuelPurchases();
  }, [fetchFuelPurchases]);
  
  useEffect(() => {
    if (id) {
      const purchase = fuelPurchases.find((p) => p.id === id);
      if (purchase) {
        setDate(new Date(purchase.date));
        setVehicleId(purchase.vehicleId);
        setFuelType(purchase.fuelType || "");
        setQuantity(purchase.quantity.toString());
        setPricePerLiter(purchase.pricePerLiter.toString());
        setTotalPrice(purchase.totalPrice.toString());
        if (purchase.mileage) setMileage(purchase.mileage.toString());
        if (purchase.station) setStation(purchase.station);
        if (purchase.notes) setNotes(purchase.notes);
      } else {
        toast({
          title: "Erreur",
          description: "Achat de carburant non trouvé",
          variant: "destructive",
        });
        navigate("/purchases");
      }
    }
  }, [id, fuelPurchases, toast, navigate]);
  
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
    
    if (id) {
      setIsLoading(true);
      
      try {
        const updatedPurchase: Partial<FuelPurchase> = {
          date: date,
          vehicleId,
          fuelType,
          quantity: parseFloat(quantity),
          pricePerLiter: parseFloat(pricePerLiter),
          totalPrice: parseFloat(totalPrice),
        };
        
        if (mileage) updatedPurchase.mileage = parseFloat(mileage);
        if (station) updatedPurchase.station = station;
        if (notes) updatedPurchase.notes = notes;
        
        await updateFuelPurchase(id, updatedPurchase);
        
        toast({
          title: "Succès",
          description: "Achat de carburant mis à jour avec succès",
        });
        
        // Rafraîchissons les données après la mise à jour
        await fetchFuelPurchases();
        
        navigate("/purchases");
      } catch (error) {
        console.error("Error updating fuel purchase:", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'achat de carburant",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  if (!id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">ID d'achat manquant</h1>
        <Button variant="outline" onClick={() => navigate("/purchases")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Modifier un Achat</h1>
          <p className="text-muted-foreground">
            Modifiez les détails de votre achat de carburant
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/purchases")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Détails de l'achat</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
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
            
            {/* Additional fields */}
            <div className="grid gap-4 md:grid-cols-2">
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
              
              <div className="space-y-2">
                <Label htmlFor="station">Station-service</Label>
                <Input
                  id="station"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  placeholder="Nom de la station"
                />
              </div>
            </div>
            
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
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchases")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Mettre à jour
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditPurchase;
