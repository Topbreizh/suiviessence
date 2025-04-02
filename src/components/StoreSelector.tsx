
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
import { Check, ChevronsUpDown, Store as StoreIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

interface StoreSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const StoreSelector = ({ value, onChange }: StoreSelectorProps) => {
  const { stores, fetchStores } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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
            ? stores.find((store) => store.id === value)?.name || "Sélectionner un magasin..."
            : "Sélectionner un magasin..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un magasin..." />
          <CommandEmpty className="py-6 text-center text-sm">
            <div>
              <p>Aucun magasin trouvé.</p>
              <Link to="/stores">
                <Button variant="link" className="mt-2 h-auto p-0">
                  <StoreIcon className="mr-1 h-3 w-3" />
                  <span className="text-xs">Gérer les magasins</span>
                </Button>
              </Link>
            </div>
          </CommandEmpty>
          <CommandGroup>
            {stores.map((store) => (
              <CommandItem
                key={store.id}
                value={store.id}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === store.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {store.name}
                {store.chainName && <span className="ml-2 text-xs text-muted-foreground">({store.chainName})</span>}
              </CommandItem>
            ))}
          </CommandGroup>
          <div className="p-2 border-t">
            <Link to="/stores">
              <Button variant="outline" size="sm" className="w-full">
                <StoreIcon className="mr-2 h-4 w-4" />
                Gérer les magasins
              </Button>
            </Link>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StoreSelector;
