import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Zap, Clock, Euro } from 'lucide-react';
import type { ChargingStation } from '@/types';

interface ChargingStationListProps {
  stations: ChargingStation[];
  onEdit: (station: ChargingStation) => void;
  onDelete: (station: ChargingStation) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ChargingStationList = ({ 
  stations, 
  onEdit, 
  onDelete, 
  searchTerm 
}: ChargingStationListProps) => {
  
  // Filter stations based on search term
  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.operator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.connectorTypes.some(type => 
      type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (filteredStations.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">Aucune borne trouvée</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchTerm ? 'Aucune borne ne correspond à votre recherche.' : 'Commencez par ajouter une borne de recharge.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredStations.map((station) => (
        <Card key={station.id} className="relative group hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  {station.name}
                  {!station.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </CardTitle>
                {station.operator && (
                  <CardDescription className="text-sm">
                    {station.operator}
                  </CardDescription>
                )}
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(station)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(station)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Location */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div>{station.address}</div>
                <div>{station.postalCode} {station.city}</div>
              </div>
            </div>

            {/* Technical specs */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {station.maxPower && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>{station.maxPower} kW</span>
                </div>
              )}
              
              {station.numberOfChargers && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span>{station.numberOfChargers} bornes</span>
                </div>
              )}
              
              {station.pricePerKwh && (
                <div className="flex items-center gap-1">
                  <Euro className="h-3 w-3 text-green-500" />
                  <span>{station.pricePerKwh.toFixed(2)}€/kWh</span>
                </div>
              )}
              
              {station.fastCharging && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Rapide
                  </Badge>
                </div>
              )}
            </div>

            {/* Connector types */}
            {station.connectorTypes.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Connecteurs:
                </div>
                <div className="flex flex-wrap gap-1">
                  {station.connectorTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {station.notes && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                {station.notes}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChargingStationList;