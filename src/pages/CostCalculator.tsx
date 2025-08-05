import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, Zap } from "lucide-react";
import { useStore } from "@/store";
import { Vehicle } from "@/types";

const CostCalculator = () => {
  const { vehicles, fetchVehicles } = useStore();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [pricePerKwh, setPricePerKwh] = useState<string>("");
  const [consumption, setConsumption] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const electricVehicles = vehicles.filter(v => v.fuelType === 'electric');

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = electricVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setConsumption(vehicle.averageConsumption?.toString() || "");
    }
  };

  const calculateCost = () => {
    const distanceNum = parseFloat(distance);
    const priceNum = parseFloat(pricePerKwh);
    const consumptionNum = parseFloat(consumption);

    if (distanceNum > 0 && priceNum >= 0 && consumptionNum > 0) {
      // Formule: (consommation/100 km) * distance * prix kWh
      const cost = (consumptionNum / 100) * distanceNum * priceNum;
      setTotalCost(cost);
    } else {
      setTotalCost(null);
    }
  };

  const costPerKm = totalCost && distance ? totalCost / parseFloat(distance) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Calculateur de Prix de Revient</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Paramètres de Calcul
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Véhicule Électrique</Label>
              <Select onValueChange={handleVehicleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {electricVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.make} {vehicle.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="Ex: 100"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumption">Consommation (kWh/100km)</Label>
              <Input
                id="consumption"
                type="number"
                step="0.1"
                placeholder="Ex: 15.5"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix du kWh (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.001"
                placeholder="Ex: 0.15 (0 pour gratuit)"
                value={pricePerKwh}
                onChange={(e) => setPricePerKwh(e.target.value)}
              />
            </div>

            <Button onClick={calculateCost} className="w-full">
              Calculer le Coût
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalCost !== null ? (
              <>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Coût Total</div>
                  <div className="text-2xl font-bold text-primary">
                    {totalCost.toFixed(2)} €
                  </div>
                </div>

                {costPerKm && (
                  <div className="p-4 bg-secondary/10 rounded-lg">
                    <div className="text-sm text-muted-foreground">Coût par Kilomètre</div>
                    <div className="text-xl font-semibold">
                      {costPerKm.toFixed(3)} €/km
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground border-t pt-4">
                  <div className="font-medium mb-2">Détail du calcul :</div>
                  <div>
                    {consumption} kWh/100km × {distance} km × {pricePerKwh} €/kWh ÷ 100
                  </div>
                  <div className="mt-1">
                    = {totalCost.toFixed(4)} €
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Remplissez tous les champs pour voir le résultat</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Formule :</strong> (Consommation ÷ 100) × Distance × Prix du kWh
            </p>
            <p>
              <strong>Exemple :</strong> Pour 100 km avec une consommation de 15 kWh/100km et un prix de 0,15 €/kWh :
            </p>
            <p className="ml-4">
              (15 ÷ 100) × 100 × 0,15 = 2,25 €
            </p>
            <p>
              Le coût par kilomètre serait alors de 0,0225 €/km.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCalculator;