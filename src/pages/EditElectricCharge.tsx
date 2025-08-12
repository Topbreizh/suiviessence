import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Zap, Info } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethod } from '@/types';

const EditElectricCharge = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    electricCharges, 
    vehicles, 
    updateElectricCharge,
    fetchElectricCharges,
    fetchVehicles,
    fetchChargingStations
  } = useStore();
  const { toast } = useToast();

  const [date, setDate] = useState<Date>(new Date());
  const [vehicleId, setVehicleId] = useState('');
  const [stationName, setStationName] = useState('');
  const [energyAmount, setEnergyAmount] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [odometerBefore, setOdometerBefore] = useState('');
  const [odometerAfter, setOdometerAfter] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only electric and hybrid vehicles
  const electricVehicles = vehicles.filter(vehicle => 
    vehicle.fuelType === 'electric' || vehicle.fuelType === 'hybrid'
  );

  // Fetch existing charge data
  useEffect(() => {
    fetchElectricCharges();
    fetchVehicles();
    fetchChargingStations();
  }, []);

  useEffect(() => {
    if (id && electricCharges.length > 0) {
      const charge = electricCharges.find(c => c.id === id);
      if (charge) {
        setDate(new Date(charge.date));
        setVehicleId(charge.vehicleId);
        setStationName(charge.stationName);
        setEnergyAmount(charge.energyAmount?.toString() || '');
        setPricePerKwh(charge.pricePerKwh.toString());
        setTotalPrice(charge.totalPrice.toString());
        setMileage(charge.mileage?.toString() || '');
        setOdometerBefore(charge.odometerBefore?.toString() || '');
        setOdometerAfter(charge.odometerAfter?.toString() || '');
        setPaymentMethod(charge.paymentMethod);
        setNotes(charge.notes || '');
      } else {
        toast({
          title: "Erreur",
          description: "Recharge électrique non trouvée",
          variant: "destructive",
        });
        navigate('/purchases');
      }
    }
  }, [id, electricCharges, navigate, toast]);

  // Update total price when energy amount or price per kWh changes
  const updateTotalPrice = () => {
    const energy = parseFloat(energyAmount);
    const price = parseFloat(pricePerKwh);
    
    if (!isNaN(energy) && !isNaN(price)) {
      setTotalPrice((energy * price).toFixed(2));
    }
  };
  
  // Update price per kWh when total price or energy amount changes
  const updatePricePerKwh = () => {
    const energy = parseFloat(energyAmount);
    const total = parseFloat(totalPrice);
    
    if (!isNaN(energy) && !isNaN(total) && energy > 0) {
      setPricePerKwh((total / energy).toFixed(3));
    }
  };

  // Calculate energy consumption based on odometer difference
  const calculateEnergyConsumption = () => {
    const before = parseFloat(odometerBefore);
    const after = parseFloat(odometerAfter);
    
    if (!isNaN(before) && !isNaN(after) && after > before) {
      return (after - before).toFixed(2);
    }
    return null;
  };

  // Calculate consumption based on odometer difference and distance
  const calculateConsumption = () => {
    const before = parseFloat(odometerBefore);
    const after = parseFloat(odometerAfter);
    const energy = parseFloat(energyAmount);
    
    if (!isNaN(before) && !isNaN(after) && !isNaN(energy) && after > before && energy > 0) {
      const distance = after - before; // distance in km
      return (energy / distance * 100).toFixed(2); // kWh/100km
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!vehicleId) {
      toast({
        title: "Véhicule manquant",
        description: "Veuillez sélectionner un véhicule électrique",
        variant: "destructive",
      });
      return;
    }
    
    const energyValue = parseFloat(energyAmount);
    const priceValue = parseFloat(pricePerKwh);
    const totalValue = parseFloat(totalPrice);
    const mileageValue = parseFloat(mileage);
    
    // Énergie optionnelle: pas de validation obligatoire
    
    if (isNaN(priceValue) || priceValue < 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez entrer un prix par kWh valide (0 pour gratuit)",
        variant: "destructive",
      });
      return;
    }
    
    
    if (!stationName.trim()) {
      toast({
        title: "Borne manquante",
        description: "Veuillez entrer le nom de la borne de recharge",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        date,
        vehicleId,
        stationName: stationName.trim(),
        ...(energyAmount && !isNaN(energyValue) ? { energyAmount: energyValue } : {}),
        pricePerKwh: priceValue,
        totalPrice: totalValue,
        ...(mileage && !isNaN(mileageValue) ? { mileage: mileageValue } : {}),
        paymentMethod,
        ...(odometerBefore && { odometerBefore: parseFloat(odometerBefore) }),
        ...(odometerAfter && { odometerAfter: parseFloat(odometerAfter) }),
        ...(notes && { notes: notes.trim() }),
      };

      await updateElectricCharge(id, updateData);

      toast({
        title: "Recharge modifiée",
        description: "La recharge électrique a été modifiée avec succès",
      });

      navigate('/purchases');
    } catch (error) {
      console.error('Error updating electric charge:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de la recharge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">ID de recharge manquant</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            Modifier la Recharge
          </h1>
          <p className="text-muted-foreground">Modifiez les détails de votre recharge électrique</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>Détails de base sur votre recharge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      {date ? format(date, "dd MMMM yyyy") : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Véhicule</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule électrique" />
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
                <Label htmlFor="station">Borne de recharge</Label>
                <Input
                  id="station"
                  placeholder="Nom de la borne"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Kilométrage</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="Kilométrage actuel"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Moyen de paiement</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un moyen de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="app">Application mobile</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails de la Recharge</CardTitle>
              <CardDescription>Informations sur l'énergie et le prix</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="energy">Énergie (kWh) — optionnel</Label>
                <Input
                  id="energy"
                  type="number"
                  step="0.01"
                  placeholder="Quantité en kWh"
                  value={energyAmount}
                  onChange={(e) => {
                    setEnergyAmount(e.target.value);
                    if (e.target.value && pricePerKwh) {
                      updateTotalPrice();
                    }
                  }}
                  onBlur={updateTotalPrice}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix par kWh (€) 0.1555€ HC et 0.224€ HP</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  placeholder="Prix par kWh"
                  value={pricePerKwh}
                  onChange={(e) => {
                    setPricePerKwh(e.target.value);
                    if (e.target.value && energyAmount) {
                      updateTotalPrice();
                    }
                  }}
                  onBlur={updateTotalPrice}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="total">Prix total (€)</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  placeholder="Prix total"
                  value={totalPrice}
                  onChange={(e) => {
                    setTotalPrice(e.target.value);
                    if (e.target.value && energyAmount) {
                      updatePricePerKwh();
                    }
                  }}
                  onBlur={updatePricePerKwh}
                />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="odometerBefore">Compteur avant charge (kWh)</Label>
                  <Input
                    id="odometerBefore"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 125.5"
                    value={odometerBefore}
                    onChange={(e) => setOdometerBefore(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odometerAfter">Compteur après charge (kWh)</Label>
                  <Input
                    id="odometerAfter"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 175.5"
                    value={odometerAfter}
                    onChange={(e) => setOdometerAfter(e.target.value)}
                  />
                </div>
              </div>

              {calculateEnergyConsumption() && (
                <div className="rounded-md bg-green-50 border border-green-200 p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Énergie consommée: {calculateEnergyConsumption()} kWh
                    </span>
                  </div>
                </div>
              )}

              {calculateConsumption() && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Consommation calculée: {calculateConsumption()} kWh/100km
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Distance parcourue: {(parseFloat(odometerAfter) - parseFloat(odometerBefore)).toFixed(2)} km
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Input
                  id="notes"
                  placeholder="Notes ou commentaires"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="rounded-md bg-muted p-4 text-sm flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Vous pouvez saisir deux valeurs parmi : énergie, prix par kWh et prix total. 
                  La troisième sera calculée automatiquement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/purchases')}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Zap className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Modification...' : 'Modifier la Recharge'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditElectricCharge;
