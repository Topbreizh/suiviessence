
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Search, Store } from 'lucide-react';
import { GasStation } from '@/types';

// Clé API Google Maps (remplacez par votre propre clé)
const GOOGLE_MAPS_API_KEY = 'AIzaSyAKOOSBfcs9zbpDW5rddPX2iO_UbhJ8ruc';

interface GasStationMapProps {
  onStationSelect: (station: GasStation) => void;
  initialLocation?: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GasStationMap: React.FC<GasStationMapProps> = ({ onStationSelect, initialLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stations, setStations] = useState<GasStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  
  // Initialiser la carte
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        window.initMap = initializeMap;
      } else {
        initializeMap();
      }
    };
    
    const initializeMap = () => {
      if (mapRef.current && !map) {
        const defaultLocation = initialLocation || { lat: 48.856614, lng: 2.3522219 }; // Paris par défaut
        
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        
        setMap(newMap);
        setIsLoading(false);
        
        // Recherche initiale des stations à proximité
        searchNearbyGasStations(newMap, defaultLocation);
      }
    };
    
    loadGoogleMapsScript();
  }, [initialLocation]);
  
  // Fonction pour rechercher les stations à proximité
  const searchNearbyGasStations = (map: google.maps.Map, location: { lat: number; lng: number }) => {
    if (!map) return;
    
    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 5000,
      type: 'gas_station',
    };
    
    service.nearbySearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const gasStations: GasStation[] = results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
          fuelTypes: [],
        }));
        
        setStations(gasStations);
        
        // Ajouter des marqueurs pour chaque station
        results.forEach((place: any) => {
          const marker = new window.google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/gas.png',
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
          
          marker.addListener('click', () => {
            const station: GasStation = {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              fuelTypes: [],
            };
            
            setSelectedStation(station);
          });
        });
      }
    });
  };
  
  // Recherche textuelle de stations
  const handleSearch = () => {
    if (!map || !searchQuery) return;
    
    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      query: `station service ${searchQuery}`,
      fields: ['name', 'geometry', 'place_id', 'vicinity'],
    };
    
    service.textSearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const gasStations: GasStation[] = results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
          fuelTypes: [],
        }));
        
        setStations(gasStations);
        
        // Centrer la carte sur le premier résultat
        if (results.length > 0) {
          map.setCenter(results[0].geometry.location);
        }
        
        // Effacer les marqueurs existants
        map.setZoom(13);
        
        // Ajouter de nouveaux marqueurs
        results.forEach((place: any) => {
          const marker = new window.google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/gas.png',
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
          
          marker.addListener('click', () => {
            const station: GasStation = {
              id: place.place_id,
              name: place.name,
              address: place.vicinity || place.formatted_address,
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              fuelTypes: [],
            };
            
            setSelectedStation(station);
          });
        });
      }
    });
  };
  
  // Sélectionner la station
  const handleSelectStation = () => {
    if (selectedStation) {
      onStationSelect(selectedStation);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Sélectionner une station-service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une station-service..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </div>
        
        <div className="rounded-md overflow-hidden border" style={{ height: '400px' }}>
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          )}
        </div>
        
        {stations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Stations à proximité:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stations.map((station) => (
                <div
                  key={station.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    selectedStation?.id === station.id
                      ? 'bg-primary/20'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedStation(station)}
                >
                  <div className="flex items-center">
                    <Store className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{station.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {station.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedStation && (
          <div className="bg-muted p-3 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{selectedStation.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedStation.address}</p>
              </div>
              <Button onClick={handleSelectStation} size="sm">
                Sélectionner
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GasStationMap;
