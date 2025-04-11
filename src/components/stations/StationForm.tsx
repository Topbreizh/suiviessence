
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { GasStation } from '@/types';

interface StationFormProps {
  initialData?: Omit<GasStation, 'id'> | null;
  stationId?: string;
  onSubmit: (data: Omit<GasStation, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const StationForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: StationFormProps) => {
  const [formData, setFormData] = useState<Omit<GasStation, 'id'>>(
    initialData || {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      company: '',
      fuelTypes: [],
      isActive: true
    }
  );

  // Common fuel types
  const commonFuelTypes = ['SP95', 'SP95-E10', 'SP98', 'Diesel', 'E85', 'GPL'];

  const handleFuelTypeChange = (fuelType: string) => {
    setFormData(prev => {
      const currentTypes = prev.fuelTypes || [];
      if (currentTypes.includes(fuelType)) {
        // Remove fuel type
        return {
          ...prev,
          fuelTypes: currentTypes.filter(type => type !== fuelType)
        };
      } else {
        // Add fuel type
        return {
          ...prev,
          fuelTypes: [...currentTypes, fuelType]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.address || !formData.city || !formData.postalCode) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-right">
          Nom <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Nom de la station"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Société</Label>
        <Input
          id="company"
          value={formData.company || ''}
          onChange={(e) => setFormData({...formData, company: e.target.value})}
          placeholder="Total, BP, Shell, etc."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address" className="text-right">
          Adresse <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="123 rue de Paris"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-right">
            Ville <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="Paris"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-right">
            Code Postal <span className="text-destructive">*</span>
          </Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
            placeholder="75001"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Types de carburant disponibles</Label>
        <div className="grid grid-cols-2 gap-2">
          {commonFuelTypes.map(fuelType => (
            <div key={fuelType} className="flex items-center space-x-2">
              <Checkbox 
                id={`fuel-${fuelType}`} 
                checked={formData.fuelTypes?.includes(fuelType) || false}
                onCheckedChange={() => handleFuelTypeChange(fuelType)}
              />
              <label 
                htmlFor={`fuel-${fuelType}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {fuelType}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Notes additionnelles"
        />
      </div>
      
      <div className="flex items-center space-x-2 pt-4">
        <Checkbox 
          id="active" 
          checked={formData.isActive}
          onCheckedChange={(checked) => 
            setFormData({...formData, isActive: checked as boolean})}
        />
        <label 
          htmlFor="active"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Station active
        </label>
      </div>
      
      <DialogFooter className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {initialData ? "Mettre à jour" : "Ajouter"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default StationForm;
