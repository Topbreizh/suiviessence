
import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

interface GasStationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const GasStationSelector = ({ value, onChange }: GasStationSelectorProps) => {
  const { gasStations, fetchGasStations } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchGasStations();
  }, [fetchGasStations]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? gasStations.find((station) => station.name === value)?.name || value
            : "Sélectionner une station..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher une station..." />
          <CommandEmpty className="py-6 text-center text-sm">
            <div>
              <p>Aucune station trouvée.</p>
              <Link to="/stations">
                <Button variant="link" className="mt-2 h-auto p-0">
                  <Fuel className="mr-1 h-3 w-3" />
                  <span className="text-xs">Gérer les stations</span>
                </Button>
              </Link>
            </div>
          </CommandEmpty>
          <CommandGroup>
            {gasStations.map((station) => (
              <CommandItem
                key={station.id}
                value={station.name}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === station.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {station.name}
                {station.brand && <span className="ml-2 text-xs text-muted-foreground">({station.brand})</span>}
              </CommandItem>
            ))}
          </CommandGroup>
          <div className="p-2 border-t">
            <Link to="/stations">
              <Button variant="outline" size="sm" className="w-full">
                <Fuel className="mr-2 h-4 w-4" />
                Gérer les stations
              </Button>
            </Link>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GasStationSelector;
