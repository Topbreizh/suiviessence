
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { Vehicle } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  make: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "La plaque d'immatriculation est requise"),
  fuelType: z.enum(["gasoline", "diesel", "electric", "hybrid", "lpg", "other"]),
  averageConsumption: z.coerce.number().min(0).optional(),
  tankCapacity: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditVehicle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, updateVehicle, fetchVehicles, isLoading } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vehicles if not already loaded
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Find the current vehicle
  const vehicle = vehicles.find(v => v.id === id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vehicle?.name || '',
      make: vehicle?.make || '',
      model: vehicle?.model || '',
      year: vehicle?.year || new Date().getFullYear(),
      licensePlate: vehicle?.licensePlate || '',
      fuelType: vehicle?.fuelType || 'gasoline',
      averageConsumption: vehicle?.averageConsumption || undefined,
      tankCapacity: vehicle?.tankCapacity || undefined,
      notes: vehicle?.notes || '',
    },
  });

  // Update form values when vehicle is loaded
  useEffect(() => {
    if (vehicle) {
      form.reset({
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        fuelType: vehicle.fuelType,
        averageConsumption: vehicle.averageConsumption,
        tankCapacity: vehicle.tankCapacity,
        notes: vehicle.notes,
      });
    }
  }, [vehicle, form]);

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateVehicle(id, values as Partial<Vehicle>);
      
      // Actualisez les données après la mise à jour
      await fetchVehicles();
      
      toast({
        title: "Véhicule mis à jour",
        description: "Le véhicule a été mis à jour avec succès",
      });
      navigate('/vehicles');
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du véhicule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-2">
            <Link to="/vehicles"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Véhicule non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="mr-2">
          <Link to="/vehicles"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Modifier un véhicule</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du véhicule</CardTitle>
          <CardDescription>Modifiez les informations de votre véhicule</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du véhicule</FormLabel>
                      <FormControl>
                        <Input placeholder="Ma voiture" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plaque d'immatriculation</FormLabel>
                      <FormControl>
                        <Input placeholder="AA-123-BB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <FormControl>
                        <Input placeholder="Renault" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle</FormLabel>
                      <FormControl>
                        <Input placeholder="Clio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de carburant</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type de carburant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gasoline">Essence</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Électrique</SelectItem>
                          <SelectItem value="hybrid">Hybride</SelectItem>
                          <SelectItem value="lpg">GPL</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consommation moyenne (L/100km)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="7.5" 
                          {...field} 
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tankCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité du réservoir (L)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="50" 
                          {...field} 
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Notes additionnelles" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="button" variant="outline" className="mr-2" asChild>
                  <Link to="/vehicles">Annuler</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Mettre à jour
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditVehicle;
