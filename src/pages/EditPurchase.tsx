
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, CreditCard, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import GasStationSelector from "@/components/GasStationSelector";
import StoreSelector from "@/components/StoreSelector";

const formSchema = z.object({
  date: z.date(),
  vehicleId: z.string().min(1, {
    message: "Veuillez sélectionner un véhicule.",
  }),
  quantity: z.coerce.number().positive({
    message: "La quantité doit être un nombre positif.",
  }),
  pricePerLiter: z.coerce.number().positive({
    message: "Le prix par litre doit être un nombre positif.",
  }),
  stationName: z.string().min(2, {
    message: "Le nom de la station doit comporter au moins 2 caractères.",
  }),
  storeId: z.string().optional(),
  address: z.string().min(5, {
    message: "L'adresse doit comporter au moins 5 caractères.",
  }),
  mileage: z.coerce.number().positive({
    message: "Le kilométrage doit être un nombre positif.",
  }),
  paymentMethod: z.enum(["card", "cash", "app", "other"], {
    required_error: "Veuillez sélectionner un mode de paiement.",
  }),
  fuelType: z.string().min(1, {
    message: "Veuillez sélectionner un type de carburant.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditPurchase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    vehicles, 
    fetchVehicles, 
    fuelPurchases, 
    fetchFuelPurchases, 
    updateFuelPurchase,
    fetchGasStations,
    stores,
    fetchStores
  } = useStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseFound, setPurchaseFound] = useState(true);

  const purchase = fuelPurchases.find((p) => p.id === id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      quantity: 0,
      pricePerLiter: 0,
      stationName: "",
      address: "",
      mileage: 0,
      paymentMethod: "card",
      notes: "",
    },
  });

  useEffect(() => {
    fetchVehicles();
    fetchFuelPurchases();
    fetchGasStations();
    fetchStores();
  }, [fetchVehicles, fetchFuelPurchases, fetchGasStations, fetchStores]);

  useEffect(() => {
    if (purchase) {
      form.reset({
        date: purchase.date,
        vehicleId: purchase.vehicleId,
        quantity: purchase.quantity,
        pricePerLiter: purchase.pricePerLiter,
        stationName: purchase.stationName,
        storeId: purchase.storeId,
        address: purchase.location.address,
        mileage: purchase.mileage,
        paymentMethod: purchase.paymentMethod,
        fuelType: purchase.fuelType,
        notes: purchase.notes,
      });
    } else if (fuelPurchases.length > 0) {
      setPurchaseFound(false);
    }
  }, [purchase, fuelPurchases, form]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const totalPrice = data.quantity * data.pricePerLiter;
      await updateFuelPurchase(id, {
        date: data.date,
        vehicleId: data.vehicleId,
        quantity: data.quantity,
        pricePerLiter: data.pricePerLiter,
        totalPrice,
        stationName: data.stationName,
        location: {
          lat: purchase?.location.lat || 0,
          lng: purchase?.location.lng || 0,
          address: data.address,
        },
        mileage: data.mileage,
        paymentMethod: data.paymentMethod,
        fuelType: data.fuelType,
        storeId: data.storeId,
        notes: data.notes,
      });

      toast({
        title: "Achat modifié",
        description: "Votre achat de carburant a été modifié avec succès.",
      });

      navigate("/purchases");
    } catch (error) {
      console.error("Erreur lors de la modification de l'achat:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'achat.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price when quantity or price changes
  const quantity = form.watch("quantity");
  const pricePerLiter = form.watch("pricePerLiter");
  const totalPrice = quantity * pricePerLiter;

  if (!purchaseFound) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Achat introuvable</CardTitle>
            <CardDescription>
              L'achat que vous recherchez n'existe pas ou a été supprimé.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/purchases")}>Retour aux achats</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Modifier un achat de carburant</CardTitle>
          <CardDescription>
            Modifiez les détails de votre achat de carburant.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
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
                                "w-full text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vehicle */}
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Véhicule</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un véhicule" />
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

                {/* Quantity */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité (L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price per liter */}
                <FormField
                  control={form.control}
                  name="pricePerLiter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix par litre (€)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Price (calculated) */}
                <FormItem>
                  <FormLabel>Prix total (€)</FormLabel>
                  <Input
                    type="number"
                    value={totalPrice.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                  <FormDescription>
                    Calculé automatiquement
                  </FormDescription>
                </FormItem>

                {/* Mileage */}
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilométrage (km)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Station Name */}
                <FormField
                  control={form.control}
                  name="stationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Station-service</FormLabel>
                      <FormControl>
                        <GasStationSelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Store */}
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Magasin associé</FormLabel>
                      <FormControl>
                        <StoreSelector
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Optionnel - Associez un magasin à cet achat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="Adresse de la station" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moyen de paiement</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un moyen de paiement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="card">
                            <div className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Carte bancaire
                            </div>
                          </SelectItem>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="app">Application mobile</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fuel Type */}
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de carburant</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type de carburant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gasoline">Essence</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="lpg">GPL</SelectItem>
                          <SelectItem value="electric">Électrique</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes additionnelles sur cet achat"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/purchases")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
