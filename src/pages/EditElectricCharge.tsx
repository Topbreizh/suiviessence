import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar as CalendarIcon, Car, Zap } from 'lucide-react';
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

  // Calculate total price when energy amount or price per kWh changes
  useEffect(() => {
    const energy = parseFloat(energyAmount);
    const price = parseFloat(pricePerKwh);
    if (!isNaN(energy) && !isNaN(price) && energy > 0 && price > 0) {
      setTotalPrice((energy * price).toFixed(2));
    }
  }, [energyAmount, pricePerKwh]);

  // Update energy amount when total price and price per kWh change
  useEffect(() => {
    const total = parseFloat(totalPrice);
    const price = parseFloat(pricePerKwh);
    if (!isNaN(total) && !isNaN(price) && total > 0 && price > 0) {
      setEnergyAmount((total / price).toFixed(2));
    }
  }, [totalPrice, pricePerKwh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!vehicleId || !stationName || !energyAmount || !pricePerKwh || !totalPrice) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateElectricCharge(id, {
        date,
        vehicleId,
        stationName,
        energyAmount: parseFloat(energyAmount),
        pricePerKwh: parseFloat(pricePerKwh),
        totalPrice: parseFloat(totalPrice),
        batteryLevelStart: batteryLevelStart ? parseInt(batteryLevelStart) : undefined,
        batteryLevelEnd: batteryLevelEnd ? parseInt(batteryLevelEnd) : undefined,
        notes: notes || undefined,
      });

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Informations de la Recharge
          </CardTitle>
          <CardDescription>
            Modifiez les détails de votre recharge électrique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date de la recharge *</Label>
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
                <Label htmlFor="vehicle">Véhicule *</Label>
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
                <Label htmlFor="stationName">Nom de la station *</Label>
                <Input
                  id="stationName"
                  type="text"
                  placeholder="Ex: Tesla Supercharger"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="energyAmount">Énergie rechargée (kWh) *</Label>
                <Input
                  id="energyAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 45.5"
                  value={energyAmount}
                  onChange={(e) => setEnergyAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerKwh">Prix par kWh (€) *</Label>
                <Input
                  id="pricePerKwh"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Ex: 0.35"
                  value={pricePerKwh}
                  onChange={(e) => setPricePerKwh(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPrice">Prix total (€) *</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 15.93"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batteryLevelStart">Niveau batterie début (%)</Label>
                <Input
                  id="batteryLevelStart"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ex: 20"
                  value={batteryLevelStart}
                  onChange={(e) => setBatteryLevelStart(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batteryLevelEnd">Niveau batterie fin (%)</Label>
                <Input
                  id="batteryLevelEnd"
                  type="number"
                  min="0"
                  max="100"
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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchases')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Modification...' : 'Modifier la Recharge'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditElectricCharge;