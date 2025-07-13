import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { ChargingStation } from '@/types';

interface ChargingStationFormProps {
  initialData?: Partial<ChargingStation> | null;
  onSubmit: (data: Omit<ChargingStation, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const connectorTypeOptions = ['Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger', 'Prise domestique'];

const ChargingStationForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: ChargingStationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    operator: '',
    connectorTypes: [] as string[],
    maxPower: undefined as number | undefined,
    pricePerKwh: undefined as number | undefined,
    numberOfChargers: undefined as number | undefined,
    fastCharging: false,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    notes: '',
    isActive: true,
  });

  const [newConnectorType, setNewConnectorType] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        city: initialData.city || '',
        postalCode: initialData.postalCode || '',
        operator: initialData.operator || '',
        connectorTypes: initialData.connectorTypes || [],
        maxPower: initialData.maxPower,
        pricePerKwh: initialData.pricePerKwh,
        numberOfChargers: initialData.numberOfChargers,
        fastCharging: initialData.fastCharging || false,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        notes: initialData.notes || '',
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      connectorTypes: formData.connectorTypes.filter(type => type.trim() !== ''),
    };

    await onSubmit(dataToSubmit);
  };

  const addConnectorType = (type: string) => {
    if (type.trim() && !formData.connectorTypes.includes(type.trim())) {
      setFormData(prev => ({
        ...prev,
        connectorTypes: [...prev.connectorTypes, type.trim()]
      }));
      setNewConnectorType('');
    }
  };

  const removeConnectorType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      connectorTypes: prev.connectorTypes.filter(t => t !== type)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de la borne *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Ex: Tesla Supercharger Aire de Repos"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operator">Opérateur</Label>
          <Input
            id="operator"
            value={formData.operator}
            onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
            placeholder="Ex: Tesla, Ionity, Fastned"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxPower">Puissance max (kW)</Label>
            <Input
              id="maxPower"
              type="number"
              value={formData.maxPower || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                maxPower: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="Ex: 150"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerKwh">Prix par kWh (€)</Label>
            <Input
              id="pricePerKwh"
              type="number"
              step="0.01"
              value={formData.pricePerKwh || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                pricePerKwh: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="Ex: 0.35"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numberOfChargers">Nombre de bornes</Label>
            <Input
              id="numberOfChargers"
              type="number"
              value={formData.numberOfChargers || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                numberOfChargers: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="Ex: 8"
            />
          </div>

          <div className="space-y-2 flex items-center justify-between pt-6">
            <Label htmlFor="fastCharging">Recharge rapide</Label>
            <Switch
              id="fastCharging"
              checked={formData.fastCharging}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fastCharging: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Types de connecteurs */}
      <div className="space-y-4">
        <Label>Types de connecteurs</Label>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newConnectorType}
              onChange={(e) => setNewConnectorType(e.target.value)}
              placeholder="Ajouter un type de connecteur"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addConnectorType(newConnectorType);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addConnectorType(newConnectorType)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {connectorTypeOptions.map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addConnectorType(type)}
                disabled={formData.connectorTypes.includes(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.connectorTypes.map((type) => (
            <Badge key={type} variant="secondary" className="pr-1">
              {type}
              <button
                type="button"
                onClick={() => removeConnectorType(type)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Localisation */}
      <div className="space-y-4">
        <Label>Localisation</Label>
        
        <div className="space-y-2">
          <Input
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Adresse complète"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Ville"
          />
          <Input
            value={formData.postalCode}
            onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
            placeholder="Code postal"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                latitude: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="Ex: 48.8566"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                longitude: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="Ex: 2.3522"
            />
          </div>
        </div>
      </div>

      {/* Notes et statut */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Informations supplémentaires..."
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isActive">Borne active</Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default ChargingStationForm;