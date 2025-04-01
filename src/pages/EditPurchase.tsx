
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, ArrowLeft } from 'lucide-react';
import { CalendarProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { FuelPurchase } from '@/types';

const formSchema = z.object({
  vehicleId: z.string().min(1, "Veuillez sélectionner un véhicule"),
  date: z.date(),
  quantity: z.coerce.number().positive("La quantité doit être positive"),
  pricePerLiter: z.coerce.number().positive("Le prix doit être positif"),
  totalPrice: z.coerce.number().positive("Le prix total doit être positif"),
  stationName: z.string().min(1, "Le nom de la station est requis"),
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
  }),
  paymentMethod: z.enum(["card", "cash", "app", "other"]),
  mileage: z.coerce.number().nonnegative("Le kilométrage doit être positif ou zéro"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditPurchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, fuelPurchases, updateFuelPurchase, fetchVehicles, fetchFuelPurchases, isLoading } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPriceCalculationLocked, setIsPriceCalculationLocked] = useState(true);

  // Fetch vehicles and purchases if not already loaded
  useEffect(() => {
    if (vehicles.length === 0) {
      fetchVehicles();
    }
    if (fuelPurchases.length === 0) {
      fetchFuelPurchases();
    }
  }, [vehicles.length, fuelPurchases.length, fetchVehicles, fetchFuelPurchases]);

  // Find the current purchase
  const purchase = fuelPurchases.find(p => p.id === id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: purchase?.vehicleId || '',
      date: purchase?.date ? new Date(purchase.date) : new Date(),
      quantity: purchase?.quantity || 0,
      pricePerLiter: purchase?.pricePerLiter || 0,
      totalPrice: purchase?.totalPrice || 0,
      stationName: purchase?.stationName || '',
      location: {
        lat: purchase?.location?.lat || 0,
        lng: purchase?.location?.lng || 0,
        address: purchase?.location?.address || '',
      },
      paymentMethod: purchase?.paymentMethod || 'card',
      mileage: purchase?.mileage || 0,
      notes: purchase?.notes || '',
    },
  });

  // Update form values when purchase is loaded
  useEffect(() => {
    if (purchase) {
      form.reset({
        vehicleId: purchase.vehicleId,
        date: new Date(purchase.date),
        quantity: purchase.quantity,
        pricePerLiter: purchase.pricePerLiter,
        totalPrice: purchase.totalPrice,
        stationName: purchase.stationName,
        location: {
          lat: purchase.location?.lat || 0,
          lng: purchase.location?.lng || 0,
          address: purchase.location?.address || '',
        },
        paymentMethod: purchase.paymentMethod,
        mileage: purchase.mileage,
        notes: purchase.notes || '',
      });
    }
  }, [purchase, form]);

  // Update total price when quantity or price per liter changes
  useEffect(() => {
    if (isPriceCalculationLocked) {
      const subscription = form.watch((value, { name }) => {
        if (name === 'quantity' || name === 'pricePerLiter') {
          const quantity = form.getValues('quantity') || 0;
          const pricePerLiter = form.getValues('pricePerLiter') || 0;
          const calculatedTotal = quantity * pricePerLiter;
          
          if (!isNaN(calculatedTotal) && calculatedTotal > 0) {
            form.setValue('totalPrice', parseFloat(calculatedTotal.toFixed(2)), { 
              shouldValidate: true 
            });
          }
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, [form, isPriceCalculationLocked]);

  // Update price per liter when total price and quantity change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!isPriceCalculationLocked && name === 'totalPrice') {
        const quantity = form.getValues('quantity') || 0;
        const totalPrice = form.getValues('totalPrice') || 0;
        
        if (quantity > 0) {
          const calculatedPricePerLiter = totalPrice / quantity;
          
          if (!isNaN(calculatedPricePerLiter) && calculatedPricePerLiter > 0) {
            form.setValue('pricePerLiter', parseFloat(calculatedPricePerLiter.toFixed(3)), { 
              shouldValidate: true 
            });
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, isPriceCalculationLocked]);

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateFuelPurchase(id, values as Partial<FuelPurchase>);
      toast({
        title: "Achat mis à jour",
        description: "L'achat de carburant a été mis à jour avec succès",
      });
      navigate('/purchases');
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'achat",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom calendar component for date selection
  const CustomCalendarHeader = (props: CalendarProps) => {
    const { month, onMonthChange, localeText } = props;
    if (!month) return null;

    const currMonth = month;
    const prevMonth = new Date(month);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const nextMonth = new Date(month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return (
      <div className="flex justify-between items-center py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange && onMonthChange(prevMonth)}
          className="h-7 w-7 p-0 flex items-center justify-center"
        >
          <span className="sr-only">Mois précédent</span>
          &lt;
        </Button>
        <div className="text-sm font-medium">
          {format(currMonth, 'MMMM yyyy', { locale: fr })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange && onMonthChange(nextMonth)}
          className="h-7 w-7 p-0 flex items-center justify-center"
        >
          <span className="sr-only">Mois suivant</span>
          &gt;
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!purchase && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-2">
            <Link to="/purchases"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Achat non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="mr-2">
          <Link to="/purchases"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Modifier un achat</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'achat</CardTitle>
          <CardDescription>Modifiez les détails de votre achat de carburant</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Véhicule</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un véhicule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.name} ({vehicle.make} {vehicle.model})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            locale={fr}
                            components={{
                              Header: CustomCalendarHeader
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Station-service</FormLabel>
                      <FormControl>
                        <Input placeholder="TotalEnergies, Esso, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moyen de paiement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un moyen de paiement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="card">Carte bancaire</SelectItem>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="app">Application mobile</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilométrage</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité (litres)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="45.67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerLiter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix au litre (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.001" 
                          placeholder="1.899" 
                          {...field} 
                          disabled={!isPriceCalculationLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Prix total (€)</FormLabel>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="h-5 text-xs"
                          onClick={() => setIsPriceCalculationLocked(!isPriceCalculationLocked)}
                        >
                          {isPriceCalculationLocked ? "Déverrouiller" : "Verrouiller"}
                        </Button>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="85.67" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {isPriceCalculationLocked 
                          ? "Le prix total est calculé automatiquement (quantité × prix au litre)" 
                          : "Le prix au litre est calculé automatiquement (prix total ÷ quantité)"}
                      </FormDescription>
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
                  <Link to="/purchases">Annuler</Link>
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

export default EditPurchase;
