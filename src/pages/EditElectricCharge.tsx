import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar as CalendarIcon, Car, Zap, Info } from 'lucide-react';
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
    chargingStations, 
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
  const [batteryLevelStart, setBatteryLevelStart] = useState('');
  const [batteryLevelEnd, setBatteryLevelEnd] = useState('');
  const [mileage, setMileage] = useState('');
  const [chargingPower, setChargingPower] = useState('');
  const [chargingDuration, setChargingDuration] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        setEnergyAmount(charge.energyAmount.toString());
        setPricePerKwh(charge.pricePerKwh.toString());
        setTotalPrice(charge.totalPrice.toString());
        setMileage(charge.mileage.toString());
        setChargingPower(charge.chargingPower?.toString() || '');
        setChargingDuration(charge.chargingDuration?.toString() || '');
        setPaymentMethod(charge.paymentMethod);
        setBatteryLevelStart(charge.batteryLevelStart?.toString() || '');
        setBatteryLevelEnd(charge.batteryLevelEnd?.toString() || '');
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

  // Helper function to normalize decimal input (handle both comma and dot)
  const normalizeDecimal = (value: string) => {
    return value.replace(',', '.');
  };

  // Update total price when energy amount or price per kWh changes
  const updateTotalPrice = () => {
    const energy = parseFloat(normalizeDecimal(energyAmount));
    const price = parseFloat(normalizeDecimal(pricePerKwh));
    
    if (!isNaN(energy) && !isNaN(price)) {
      setTotalPrice((energy * price).toFixed(2));
    }
  };
  
  // Update price per kWh when total price or energy amount changes
  const updatePricePerKwh = () => {
    const energy = parseFloat(normalizeDecimal(energyAmount));
    const total = parseFloat(normalizeDecimal(totalPrice));
    
    if (!isNaN(energy) && !isNaN(total) && energy > 0) {
      setPricePerKwh((total / energy).toFixed(3));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!vehicleId || !stationName || !energyAmount || pricePerKwh === '' || !totalPrice || !mileage) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        date,
        vehicleId,
        stationName,
        energyAmount: parseFloat(normalizeDecimal(energyAmount)),
        pricePerKwh: parseFloat(normalizeDecimal(pricePerKwh)),
        totalPrice: parseFloat(normalizeDecimal(totalPrice)),
        mileage: parseFloat(normalizeDecimal(mileage)),
        paymentMethod,
        ...(chargingPower && { chargingPower: parseFloat(normalizeDecimal(chargingPower)) }),
        ...(chargingDuration && { chargingDuration: parseFloat(normalizeDecimal(chargingDuration)) }),
        ...(batteryLevelStart && { batteryLevelStart: parseInt(batteryLevelStart) }),
        ...(batteryLevelEnd && { batteryLevelEnd: parseInt(batteryLevelEnd) }),
        ...(notes && { notes }),
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
      setIsLoading(false);
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/purchases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier la Recharge Électrique</h1>
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
                <Label htmlFor="date">Date de la recharge</Label>
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
                      {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
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

              <div className="space-y-2">
                <Label htmlFor="vehicle">Véhicule</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          {vehicle.name} ({vehicle.make} {vehicle.model})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stationName">Nom de la station</Label>
                <Input
                  id="stationName"
                  type="text"
                  placeholder="Ex: Tesla Supercharger"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Kilométrage</Label>
                <Input
                  id="mileage"
                  inputMode="numeric"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chargingPower">Puissance (kW)</Label>
                  <Input
                    id="chargingPower"
                    inputMode="decimal"
                    placeholder="Puissance de charge"
                    value={chargingPower}
                    onChange={(e) => setChargingPower(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chargingDuration">Durée (min)</Label>
                  <Input
                    id="chargingDuration"
                    inputMode="decimal"
                    placeholder="Durée de charge"
                    value={chargingDuration}
                    onChange={(e) => setChargingDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batteryLevelStart">Batterie début (%)</Label>
                  <Input
                    id="batteryLevelStart"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ex: 20"
                    value={batteryLevelStart}
                    onChange={(e) => setBatteryLevelStart(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batteryLevelEnd">Batterie fin (%)</Label>
                  <Input
                    id="batteryLevelEnd"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ex: 80"
                    value={batteryLevelEnd}
                    onChange={(e) => setBatteryLevelEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes additionnelles..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
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
                <Label htmlFor="energyAmount">Énergie rechargée (kWh)</Label>
                <Input
                  id="energyAmount"
                  inputMode="decimal"
                  placeholder="Ex: 45.5"
                  value={energyAmount}
                  onChange={(e) => {
                    setEnergyAmount(e.target.value);
                  }}
                  onBlur={() => {
                    if (energyAmount && pricePerKwh) {
                      updateTotalPrice();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerKwh">Prix par kWh (€) 0.1555€ HC et 0.224€ HP</Label>
                <Input
                  id="pricePerKwh"
                  inputMode="decimal"
                  placeholder="Ex: 0.35"
                  value={pricePerKwh}
                  onChange={(e) => {
                    setPricePerKwh(e.target.value);
                  }}
                  onBlur={() => {
                    if (pricePerKwh && energyAmount) {
                      updateTotalPrice();
                    }
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="totalPrice">Prix total (€)</Label>
                <Input
                  id="totalPrice"
                  inputMode="decimal"
                  placeholder="Ex: 15.93"
                  value={totalPrice}
                  onChange={(e) => {
                    setTotalPrice(e.target.value);
                  }}
                  onBlur={() => {
                    if (totalPrice && energyAmount) {
                      updatePricePerKwh();
                    }
                  }}
                />
              </div>

              <div className="rounded-md bg-muted p-4 text-sm flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Vous pouvez saisir deux valeurs parmi : énergie, prix par kWh et prix total. 
                  La troisième sera calculée automatiquement lorsque vous quittez le champ.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/purchases')}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Zap className="mr-2 h-4 w-4" />
            {isLoading ? 'Modification...' : 'Modifier la Recharge'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditElectricCharge;
