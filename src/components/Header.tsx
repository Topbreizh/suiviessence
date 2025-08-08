
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, RefreshCw } from "lucide-react";
import { useStore } from "@/store";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { fetchFuelPurchases, fetchVehicles, isLoading } = useStore();
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      await Promise.all([
        fetchFuelPurchases(),
        fetchVehicles()
      ]);
      
      toast({
        title: "Synchronisation réussie",
        description: "Les données ont été synchronisées avec Firebase",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur est survenue lors de la synchronisation",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <h1 className="text-xl font-bold ml-2 md:ml-0">
          <span className="text-primary">Suivi</span>Conso</span>Voiture
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleSync}
          disabled={syncing || isLoading}
        >
          <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Synchroniser avec Firebase</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
