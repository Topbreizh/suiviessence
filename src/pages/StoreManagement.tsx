
import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Store as StoreIcon, Plus, MoreHorizontal, Edit, Trash, MapPin } from "lucide-react";
import GasStationSelector from "@/components/GasStationSelector";

const storeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères.",
  }),
  chainName: z.string().optional(),
  hasGasStation: z.boolean().default(false),
  stationId: z.string().optional(),
  openingHours: z.string().optional(),
  notes: z.string().optional(),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

const StoreManagement = () => {
  const { stores, fetchStores, addStore, updateStore, deleteStore, gasStations, fetchGasStations } = useStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      chainName: "",
      hasGasStation: false,
      stationId: "",
      openingHours: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchStores();
    fetchGasStations();
  }, [fetchStores, fetchGasStations]);

  useEffect(() => {
    if (editingStore) {
      form.reset({
        name: editingStore.name,
        address: editingStore.address,
        chainName: editingStore.chainName || "",
        hasGasStation: editingStore.hasGasStation || false,
        stationId: editingStore.stationId || "",
        openingHours: editingStore.openingHours || "",
        notes: editingStore.notes || "",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        chainName: "",
        hasGasStation: false,
        stationId: "",
        openingHours: "",
        notes: "",
      });
    }
  }, [editingStore, form]);

  const onSubmit = async (data: StoreFormValues) => {
    try {
      if (editingStore) {
        await updateStore(editingStore.id, data);
        toast({
          title: "Succès",
          description: "Magasin mis à jour avec succès",
        });
      } else {
        await addStore(data);
        toast({
          title: "Succès",
          description: "Magasin ajouté avec succès",
        });
      }
      setOpenDialog(false);
      setEditingStore(null);
      form.reset();
    } catch (error) {
      console.error("Error saving store:", error);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce magasin ?")) {
      try {
        await deleteStore(id);
        toast({
          title: "Succès",
          description: "Magasin supprimé avec succès",
        });
      } catch (error) {
        console.error("Error deleting store:", error);
      }
    }
  };

  const hasGasStation = form.watch("hasGasStation");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Magasins</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStore(null)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un magasin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingStore ? "Modifier le magasin" : "Ajouter un magasin"}
              </DialogTitle>
              <DialogDescription>
                {editingStore
                  ? "Modifiez les informations du magasin ci-dessous."
                  : "Entrez les informations du nouveau magasin."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du magasin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse*</FormLabel>
                      <FormControl>
                        <Input placeholder="Adresse du magasin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chainName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la chaîne</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Carrefour, Auchan..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasGasStation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Possède une station-service</FormLabel>
                        <FormDescription>
                          Cochez cette case si ce magasin a une station-service
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {hasGasStation && (
                  <FormField
                    control={form.control}
                    name="stationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Station-service associée</FormLabel>
                        <FormControl>
                          <div className="w-full">
                            <GasStationSelector
                              value={gasStations.find(station => station.id === field.value)?.name || ""}
                              onChange={(stationName) => {
                                const station = gasStations.find(s => s.name === stationName);
                                form.setValue("stationId", station?.id || "");
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="openingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horaires d'ouverture</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 9h-19h du lundi au samedi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes supplémentaires"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="w-full">Enregistrer</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des magasins</CardTitle>
          <CardDescription>
            Gérez vos magasins préférés et associez-les à vos achats de carburant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Liste des magasins enregistrés</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Chaîne</TableHead>
                <TableHead>Station-service</TableHead>
                <TableHead>Horaires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Aucun magasin trouvé. Ajoutez-en un en cliquant sur le bouton "Ajouter un magasin".
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell>{store.chainName || "-"}</TableCell>
                    <TableCell>
                      {store.hasGasStation ? "Oui" : "Non"}
                    </TableCell>
                    <TableCell>{store.openingHours || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(store)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(store.id)} className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreManagement;
