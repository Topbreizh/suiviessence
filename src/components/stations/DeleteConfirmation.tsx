
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { GasStation } from '@/types';

interface DeleteConfirmationProps {
  station: GasStation | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteConfirmation = ({ station, onConfirm, onCancel, isLoading }: DeleteConfirmationProps) => {
  if (!station) return null;

  return (
    <>
      <div className="p-4 border rounded-md space-y-2">
        <div className="font-medium">{station.name}</div>
        <div className="text-sm text-muted-foreground">
          {station.address}, {station.city}
        </div>
      </div>
      
      <DialogFooter className="flex justify-between sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </DialogFooter>
    </>
  );
};

export default DeleteConfirmation;
