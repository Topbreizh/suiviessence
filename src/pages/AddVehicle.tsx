
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Car } from 'lucide-react';
import { FuelType } from '@/types';

const AddVehicle = () => {
  const navigate = useNavigate();
  const { addVehicle } = useStore();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');
  const [averageConsumption, setAverageConsumption] = useState('');
  const [tankCapacity, setTankCapacity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nom manquant",
        description: "Veuillez entrer un nom pour le véhicule",
        variant: "destructive",
      });
      return;
    }
    
    if (!make.trim()) {
      toast({
        title: "Marque manquante",
        description: "Veuillez entrer la marque du véhicule",
        variant: "destructive",
      });
      return;
    }
    
    if (!model.trim()) {
      toast({
        title: "Modèle manquant",
        description: "Veuillez entrer le modèle du véhicule",
        variant: "destructive",
      });
      return;
    }
    
    if (!year) {
      toast({
        title: "Année manquante",
        description: "Veuillez sélectionner l'année du véhicule",
        variant: "destructive",
      });
      return;
    }
    
    if (!licensePlate.trim()) {
      toast({
        title: "Immatriculation manquante",
        description: "Veuillez entrer l'immatriculation du véhicule",
        variant: "destructive",
      });
      return;
    }
    
    const yearValue = parseInt(year);
    const consumptionValue = averageConsumption ? parseFloat(averageConsumption) : undefined;
    const tankValue = tankCapacity ? parseFloat(tankCapacity) : undefined;
    
    setIsSubmitting(true);
    
    try {
      await addVehicle({
        name: name.trim(),
        make: make.trim(),
        model: model.trim(),
        year: yearValue,
        licensePlate: licensePlate.trim(),
        fuelType,
        averageConsumption: consumptionValue,
        tankCapacity: tankValue,
        notes: notes.trim(),
      });
      
      toast({
        title: "Véhicule ajouté",
        description: "Le véhicule a été ajouté avec succès",
      });
      
      navigate('/vehicles');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du véhicule",
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
          <h1 className="text-3xl font-bold tracking-tight">Nouveau Véhicule</h1>
          <p className="text-muted-foreground">Ajoutez un nouveau véhicule à votre flotte</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du Véhicule</CardTitle>
            <CardDescription>Entrez les détails de votre véhicule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Véhicule</Label>
                <Input
                  id="name"
                  placeholder="Ex: Ma Voiture"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Immatriculation</Label>
                <Input
                  id="licensePlate"
                  placeholder="Ex: AB-123-CD"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="make">Marque</Label>
                <Input
                  id="make"
                  placeholder="Ex: Renault"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  placeholder="Ex: Clio"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fuelType">Type de Carburant</Label>
                <Select 
                  value={fuelType} 
                  onValueChange={(value) => setFuelType(value as FuelType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de carburant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Essence</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Électrique</SelectItem>
                    <SelectItem value="hybrid">Hybride</SelectItem>
                    <SelectItem value="lpg">GPL</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="consumption">Consommation Moyenne (L/100km) (optionnel)</Label>
                <Input
                  id="consumption"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 6.5"
                  value={averageConsumption}
                  onChange={(e) => setAverageConsumption(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tankCapacity">Capacité du Réservoir (litres) (optionnel)</Label>
                <Input
                  id="tankCapacity"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 50"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Notes ou commentaires sur ce véhicule"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 flex items-center justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/vehicles')}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Car className="mr-2 h-4 w-4" />
            Ajouter le Véhicule
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddVehicle;
