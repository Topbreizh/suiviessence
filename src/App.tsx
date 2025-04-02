
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Purchases from "@/pages/Purchases";
import Vehicles from "@/pages/Vehicles";
import Statistics from "@/pages/Statistics";
import AddPurchase from "@/pages/AddPurchase";
import AddVehicle from "@/pages/AddVehicle";
import EditVehicle from "@/pages/EditVehicle";
import EditPurchase from "@/pages/EditPurchase";
import GasStations from "@/pages/GasStations";
import StoreManagement from "@/pages/StoreManagement";
import NotFound from "@/pages/NotFound";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="gasoline-guru-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="purchases/add" element={<AddPurchase />} />
              <Route path="purchases/edit/:id" element={<EditPurchase />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="vehicles/add" element={<AddVehicle />} />
              <Route path="vehicles/edit/:id" element={<EditVehicle />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="stations" element={<GasStations />} />
              <Route path="stores" element={<StoreManagement />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
