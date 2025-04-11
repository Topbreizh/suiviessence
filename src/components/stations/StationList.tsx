
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Check, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { GasStation } from '@/types';

interface StationListProps {
  stations: GasStation[];
  onEdit: (station: GasStation) => void;
  onDelete: (station: GasStation) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const StationList = ({ 
  stations, 
  onEdit, 
  onDelete, 
  searchTerm,
  setSearchTerm 
}: StationListProps) => {
  // Handle search
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredStations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">Aucune station trouvée</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? "Aucune station ne correspond à votre recherche." 
              : "Vous n'avez pas encore ajouté de stations. Commencez par en ajouter une !"}
          </p>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Effacer la recherche
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Types de carburant</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map((station) => (
              <TableRow key={station.id}>
                <TableCell className="font-medium">
                  {station.company ? (
                    <div>
                      <div>{station.name}</div>
                      <div className="text-xs text-muted-foreground">{station.company}</div>
                    </div>
                  ) : (
                    station.name
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-start">
                    <MapPin className="mr-1 h-3 w-3 translate-y-1 text-muted-foreground" />
                    <div>
                      <div>{station.address}</div>
                      <div className="text-xs text-muted-foreground">
                        {station.postalCode} {station.city}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {station.fuelTypes?.length > 0 ? (
                      station.fuelTypes.map((type) => (
                        <span key={type} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Non spécifié</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {station.isActive ? (
                    <span className="flex items-center text-green-600">
                      <Check className="mr-1 h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-500">
                      <X className="mr-1 h-4 w-4" /> Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(station)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(station)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StationList;
