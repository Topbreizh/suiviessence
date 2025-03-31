
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

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
          <span className="text-primary">Gestion</span> essence
        </h1>
      </div>
      <div className="flex items-center gap-2">
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
