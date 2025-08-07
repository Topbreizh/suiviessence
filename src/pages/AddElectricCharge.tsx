import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PaymentMethod } from '@/types';

const AddElectricCharge = () => {
  const navigate = useNavigate();
  const { vehicles, addElectricCharge } = useStore();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date>(new Date());
  const [vehicleId, setVehicleId] = useState('');
  const [energyAmount, setEnergyAmount] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [stationName, setStationName] = useState('');
  const [mileage, setMileage] = useState('');
  const [chargingPower, setChargingPower] = useState('');
  const [chargingDuration, setChargingDuration] = useState('');
  const [batteryLevelStart, setBatteryLevelStart] = useState('');
  const [batteryLevelEnd, setBatteryLevelEnd] = useState('');
  const [odometerBefore, setOdometerBefore] = useState('');
  const [odometerAfter, setOdometerAfter] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter only electric and hybrid vehicles
  const electricVehicles = vehicles.filter(vehicle => 
    vehicle.fuelType === 'electric' || vehicle.fuelType === 'hybrid'
  );
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    if (isNaN(energyValue) || energyValue <= 0) {
      toast({
        title: "Énergie invalide",
        description: "Veuillez entrer une quantité d'énergie valide",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(priceValue) || priceValue < 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez entrer un prix par kWh valide (0 pour gratuit)",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(mileageValue) || mileageValue <= 0) {
      toast({
        title: "Kilométrage invalide",
        description: "Veuillez entrer un kilométrage valide",
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
      console.log('Tentative d\'ajout de recharge électrique:', {
        date,
        vehicleId,
        energyAmount: energyValue,
        pricePerKwh: priceValue,
        totalPrice: totalValue,
        stationName: stationName.trim(),
        mileage: mileageValue,
        paymentMethod,
      });
      
      await addElectricCharge({
        date,
        vehicleId,
        energyAmount: energyValue,
        pricePerKwh: priceValue,
        totalPrice: totalValue,
        stationName: stationName.trim(),
        location: {
          lat: 0,
          lng: 0,
          address: '',
        },
        mileage: mileageValue,
        paymentMethod,
        chargingPower: chargingPower ? parseFloat(chargingPower) : undefined,
        chargingDuration: chargingDuration ? parseFloat(chargingDuration) : undefined,
        batteryLevelStart: batteryLevelStart ? parseFloat(batteryLevelStart) : undefined,
        batteryLevelEnd: batteryLevelEnd ? parseFloat(batteryLevelEnd) : undefined,
        odometerBefore: odometerBefore ? parseFloat(odometerBefore) : undefined,
        odometerAfter: odometerAfter ? parseFloat(odometerAfter) : undefined,
        notes: notes.trim(),
      });
      
      console.log('Recharge électrique ajoutée avec succès');
      
      toast({
        title: "Recharge ajoutée",
        description: "La recharge électrique a été ajoutée avec succès",
      });
      
      navigate('/purchases');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la recharge:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la recharge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            Nouvelle Recharge
          </h1>
          <p className="text-muted-foreground">Enregistrez une nouvelle recharge électrique</p>
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
                <Label htmlFor="energy">Énergie (kWh)</Label>
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
                  <Label htmlFor="power">Puissance (kW)</Label>
                  <Input
                    id="power"
                    type="number"
                    placeholder="Puissance de charge"
                    value={chargingPower}
                    onChange={(e) => setChargingPower(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Durée de charge"
                    value={chargingDuration}
                    onChange={(e) => setChargingDuration(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batteryStart">Batterie début (%)</Label>
                  <Input
                    id="batteryStart"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="% au début"
                    value={batteryLevelStart}
                    onChange={(e) => setBatteryLevelStart(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batteryEnd">Batterie fin (%)</Label>
                  <Input
                    id="batteryEnd"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="% à la fin"
                    value={batteryLevelEnd}
                    onChange={(e) => setBatteryLevelEnd(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="odometerBefore">Compteur avant (kWh)</Label>
                  <Input
                    id="odometerBefore"
                    type="number"
                    placeholder="KWh avant charge"
                    value={odometerBefore}
                    onChange={(e) => setOdometerBefore(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="odometerAfter">Compteur après (kWh)</Label>
                  <Input
                    id="odometerAfter"
                    type="number"
                    placeholder="KWh après charge"
                    value={odometerAfter}
                    onChange={(e) => setOdometerAfter(e.target.value)}
                  />
                </div>
              </div>
              
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
            Enregistrer la Recharge
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddElectricCharge;
