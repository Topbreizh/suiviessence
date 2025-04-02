
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Car, Fuel, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PaymentMethod } from '@/types';

const AddPurchase = () => {
  const navigate = useNavigate();
  const { vehicles, addFuelPurchase } = useStore();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date>(new Date());
  const [vehicleId, setVehicleId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [stationName, setStationName] = useState('');
  const [mileage, setMileage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update total price when quantity or price per liter changes
  const updateTotalPrice = () => {
    const qty = parseFloat(quantity);
    const price = parseFloat(pricePerLiter);
    
    if (!isNaN(qty) && !isNaN(price)) {
      setTotalPrice((qty * price).toFixed(2));
    }
  };
  
  // Update price per liter when total price or quantity changes
  const updatePricePerLiter = () => {
    const qty = parseFloat(quantity);
    const total = parseFloat(totalPrice);
    
    if (!isNaN(qty) && !isNaN(total) && qty > 0) {
      setPricePerLiter((total / qty).toFixed(3));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId) {
      toast({
        title: "Véhicule manquant",
        description: "Veuillez sélectionner un véhicule",
        variant: "destructive",
      });
      return;
    }
    
    const qtyValue = parseFloat(quantity);
    const priceValue = parseFloat(pricePerLiter);
    const totalValue = parseFloat(totalPrice);
    const mileageValue = parseFloat(mileage);
    
    if (isNaN(qtyValue) || qtyValue <= 0) {
      toast({
        title: "Quantité invalide",
        description: "Veuillez entrer une quantité valide",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez entrer un prix par litre valide",
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
        title: "Station manquante",
        description: "Veuillez entrer le nom de la station-service",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      addFuelPurchase({
        date,
        vehicleId,
        quantity: qtyValue,
        pricePerLiter: priceValue,
        totalPrice: totalValue,
        stationName: stationName.trim(),
        location: {
          lat: 0,
          lng: 0,
          address: '',
        },
        mileage: mileageValue,
        paymentMethod,
        notes: notes.trim(),
      });
      
      toast({
        title: "Achat ajouté",
        description: "L'achat de carburant a été ajouté avec succès",
      });
      
      navigate('/purchases');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'achat",
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
          <h1 className="text-3xl font-bold tracking-tight">Nouvel Achat</h1>
          <p className="text-muted-foreground">Enregistrez un nouvel achat de carburant</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>Détails de base sur votre achat</CardDescription>
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
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.make} {vehicle.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="station">Station-service</Label>
                <Input
                  id="station"
                  placeholder="Nom de la station"
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
              <CardTitle>Détails du Plein</CardTitle>
              <CardDescription>Informations sur la quantité et le prix</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité (litres)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="Quantité en litres"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (e.target.value && pricePerLiter) {
                      updateTotalPrice();
                    }
                  }}
                  onBlur={updateTotalPrice}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Prix au litre (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  placeholder="Prix par litre"
                  value={pricePerLiter}
                  onChange={(e) => {
                    setPricePerLiter(e.target.value);
                    if (e.target.value && quantity) {
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
                    if (e.target.value && quantity) {
                      updatePricePerLiter();
                    }
                  }}
                  onBlur={updatePricePerLiter}
                />
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
                  Vous pouvez saisir deux valeurs parmi : quantité, prix au litre et prix total. 
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
            <Fuel className="mr-2 h-4 w-4" />
            Enregistrer l'Achat
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPurchase;
