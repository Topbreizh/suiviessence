
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Fuel, Car, BarChart3, LayoutDashboard, PlusCircle, MapPin, Zap, Calculator } from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();
  
  return (
    <>
      <nav className="hidden md:flex md:w-64 border-r bg-sidebar h-full flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <Fuel className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">
              <span className="text-primary">Gasoline</span> Guru
            </span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-1 py-2">
            <NavItem
              to="/"
              active={location.pathname === "/"}
              icon={<LayoutDashboard className="mr-2 h-5 w-5" />}
              label="Dashboard"
            />
            <NavItem
              to="/purchases"
              active={location.pathname.includes("/purchases")}
              icon={<Fuel className="mr-2 h-5 w-5" />}
              label="Achats"
            />
            <NavItem
              to="/vehicles"
              active={location.pathname.includes("/vehicles")}
              icon={<Car className="mr-2 h-5 w-5" />}
              label="Véhicules"
            />
            <NavItem
              to="/stations"
              active={location.pathname === "/stations" || location.pathname === "/charging-stations"}
              icon={<MapPin className="mr-2 h-5 w-5" />}
              label="Stations"
            />
            <NavItem
              to="/statistics"
              active={location.pathname === "/statistics" || location.pathname === "/electric-statistics"}
              icon={<BarChart3 className="mr-2 h-5 w-5" />}
              label="Statistiques"
            />
            <NavItem
              to="/cost-calculator"
              active={location.pathname === "/cost-calculator"}
              icon={<Calculator className="mr-2 h-5 w-5" />}
              label="Calculateur"
            />
          </div>
        </ScrollArea>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-2">
              <Fuel className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">
                <span className="text-primary">Suivi Conso</span> Voiture
              </span>
            </Link>
          </div>
          <ScrollArea className="px-4 flex-1">
            <div className="flex flex-col gap-1 py-2">
              <NavItem
                to="/"
                active={location.pathname === "/"}
                icon={<LayoutDashboard className="mr-2 h-5 w-5" />}
                label="Dashboard"
                onClick={() => setOpen(false)}
              />
              <NavItem
                to="/purchases"
                active={location.pathname.includes("/purchases")}
                icon={<Fuel className="mr-2 h-5 w-5" />}
                label="Achats"
                onClick={() => setOpen(false)}
              />
              <NavItem
                to="/vehicles"
                active={location.pathname.includes("/vehicles")}
                icon={<Car className="mr-2 h-5 w-5" />}
                label="Véhicules"
                onClick={() => setOpen(false)}
              />
              <NavItem
                to="/stations"
                active={location.pathname === "/stations" || location.pathname === "/charging-stations"}
                icon={<MapPin className="mr-2 h-5 w-5" />}
                label="Stations"
                onClick={() => setOpen(false)}
              />
              <NavItem
                to="/statistics"
                active={location.pathname === "/statistics" || location.pathname === "/electric-statistics"}
                icon={<BarChart3 className="mr-2 h-5 w-5" />}
                label="Statistiques"
                onClick={() => setOpen(false)}
              />
              <NavItem
                to="/cost-calculator"
                active={location.pathname === "/cost-calculator"}
                icon={<Calculator className="mr-2 h-5 w-5" />}
                label="Calculateur"
                onClick={() => setOpen(false)}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

interface NavItemProps {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  indent?: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, active, icon, label, indent = false, onClick }: NavItemProps) => {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "justify-start hover:bg-sidebar-accent",
        active && "bg-sidebar-accent text-sidebar-accent-foreground",
        indent && "ml-4 w-[calc(100%-1rem)]"
      )}
      onClick={onClick}
    >
      <Link to={to}>
        {icon}
        {label}
      </Link>
    </Button>
  );
};

export default Sidebar;
