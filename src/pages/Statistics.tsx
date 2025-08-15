import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { format, getMonth, getYear, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Info, MapPin, Zap, Fuel, Gauge } from 'lucide-react';

const Statistics = () => {
  const { 
    fuelPurchases, 
    vehicles, 
    electricCharges, 
    fetchFuelPurchases, 
    fetchVehicles, 
    fetchElectricCharges 
  } = useStore();
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | 'all'>('all');
  const [selectedFuelType, setSelectedFuelType] = useState<string | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<string | 'all'>('all');

  // Fetch data on component mount
  useEffect(() => {
    console.log('Fetching data...');
    fetchFuelPurchases();
    fetchVehicles();
    fetchElectricCharges();
  }, [fetchFuelPurchases, fetchVehicles, fetchElectricCharges]);

  // Initialize with all vehicles selected when vehicles are loaded
  useEffect(() => {
    if (vehicles.length > 0 && selectedVehicles.length === 0) {
      setSelectedVehicles(vehicles.map(v => v.id));
    }
  }, [vehicles, selectedVehicles.length]);

  // Handle vehicle selection
  const handleVehicleToggle = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSelectAllVehicles = () => {
    setSelectedVehicles(vehicles.map(v => v.id));
  };

  const handleDeselectAllVehicles = () => {
    setSelectedVehicles([]);
  };

  // Get available years and months from data
  const availableYears = Array.from(
    new Set([
      ...fuelPurchases.map(p => getYear(new Date(p.date))),
      ...electricCharges.map(c => getYear(new Date(c.date)))
    ])
  ).sort((a, b) => b - a);

  const availableMonths = [
    { value: '0', label: 'Janvier' },
    { value: '1', label: 'Février' },
    { value: '2', label: 'Mars' },
    { value: '3', label: 'Avril' },
    { value: '4', label: 'Mai' },
    { value: '5', label: 'Juin' },
    { value: '6', label: 'Juillet' },
    { value: '7', label: 'Août' },
    { value: '8', label: 'Septembre' },
    { value: '9', label: 'Octobre' },
    { value: '10', label: 'Novembre' },
    { value: '11', label: 'Décembre' }
  ];

  // Filter data by date range
  const filterByDateRange = (data: any[], dateField: string = 'date') => {
    if (selectedMonth === 'all' && selectedYear === 'all') return data;

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      
      if (selectedYear !== 'all' && selectedMonth !== 'all') {
        // Filter by specific month and year
        const monthStart = startOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth)));
        const monthEnd = endOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth)));
        return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
      } else if (selectedYear !== 'all') {
        // Filter by year only
        const yearStart = startOfYear(new Date(parseInt(selectedYear), 0));
        const yearEnd = endOfYear(new Date(parseInt(selectedYear), 0));
        return isWithinInterval(itemDate, { start: yearStart, end: yearEnd });
      }
      
      return true;
    });
  };

  // Apply all filters
  const filteredPurchases = filterByDateRange(
    selectedVehicles.length === 0
      ? fuelPurchases
      : fuelPurchases.filter(p => selectedVehicles.includes(p.vehicleId))
  );

  const filteredElectricCharges = filterByDateRange(
    selectedVehicles.length === 0
      ? electricCharges
      : electricCharges.filter(c => selectedVehicles.includes(c.vehicleId))
  ).filter(charge => {
    return selectedStation === 'all' || charge.stationName === selectedStation;
  });

  // Get vehicle name by id
  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Véhicule inconnu';
  };

  // Calculate kilometers driven from mileage differences
  const calculateKilometersDriven = (purchases: typeof fuelPurchases) => {
    const vehicleKm: Record<string, number> = {};
    
    // Group purchases by vehicle and sort by date
    const purchasesByVehicle = purchases.reduce((acc, purchase) => {
      if (!acc[purchase.vehicleId]) {
        acc[purchase.vehicleId] = [];
      }
      acc[purchase.vehicleId].push(purchase);
      return acc;
    }, {} as Record<string, typeof purchases>);

    // Calculate kilometers for each vehicle
    Object.entries(purchasesByVehicle).forEach(([vehicleId, vehiclePurchases]) => {
      const sortedPurchases = vehiclePurchases
        .filter(p => p.mileage && p.mileage > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let totalKm = 0;
      for (let i = 1; i < sortedPurchases.length; i++) {
        const currentMileage = sortedPurchases[i].mileage;
        const previousMileage = sortedPurchases[i - 1].mileage;
        
        if (currentMileage > previousMileage) {
          totalKm += currentMileage - previousMileage;
        }
      }
      
      vehicleKm[vehicleId] = totalKm;
    });

    return vehicleKm;
  };

  // Calculate total kilometers driven
  const vehicleKilometers = calculateKilometersDriven(filteredPurchases);
  const totalKilometers = Object.values(vehicleKilometers).reduce((sum, km) => sum + km, 0);

  // Calculate kilometers by vehicle for bar chart
  const kmByVehicleData = vehicles
    .filter(vehicle => selectedVehicles.includes(vehicle.id))
    .map(vehicle => {
      const totalKm = vehicleKilometers[vehicle.id] || 0;
      
      return {
        name: vehicle.name,
        kilometers: totalKm,
        id: vehicle.id
      };
    })
    .filter(v => v.kilometers > 0);

  // Calculate kilometers by vehicle for pie chart
  const kmByVehiclePie = vehicles
    .filter(vehicle => selectedVehicles.includes(vehicle.id))
    .map(vehicle => {
      const totalKm = vehicleKilometers[vehicle.id] || 0;
      
      return {
        name: vehicle.name,
        value: totalKm,
        id: vehicle.id
      };
    })
    .filter(v => v.value > 0);

  // Get all unique station names (fuel + electric) and fuel types
  const stationNames = Array.from(
    new Set([
      ...fuelPurchases.map(p => p.stationName),
      ...electricCharges.map(c => c.stationName)
    ])
  ).filter(Boolean).sort();

  const fuelTypes = Array.from(
    new Set(fuelPurchases.map(p => p.fuelType))
  ).filter(Boolean).sort();

  // Calculate monthly spending (including electric charges)
  const monthlyData: Record<string, { month: string, totalFuel: number, totalElectric: number, total: number, liters: number, kwh: number, label: string }> = {};
  
  // Add fuel purchases
  filteredPurchases.forEach(purchase => {
    const date = new Date(purchase.date);
    const monthYear = format(date, 'MM/yyyy');
    const monthLabel = format(date, 'MMM yyyy', { locale: fr });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        totalFuel: 0,
        totalElectric: 0,
        total: 0,
        liters: 0,
        kwh: 0,
        label: monthLabel
      };
    }
    
    monthlyData[monthYear].totalFuel += purchase.totalPrice;
    monthlyData[monthYear].total += purchase.totalPrice;
    monthlyData[monthYear].liters += purchase.quantity;
  });

  // Add electric charges
  filteredElectricCharges.forEach(charge => {
    const date = new Date(charge.date);
    const monthYear = format(date, 'MM/yyyy');
    const monthLabel = format(date, 'MMM yyyy', { locale: fr });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        totalFuel: 0,
        totalElectric: 0,
        total: 0,
        liters: 0,
        kwh: 0,
        label: monthLabel
      };
    }
    
    monthlyData[monthYear].totalElectric += charge.totalPrice;
    monthlyData[monthYear].total += charge.totalPrice;
    monthlyData[monthYear].kwh += charge.energyAmount;
  });
  
  // Convert to array and sort by date
  const monthlySpendingData = Object.values(monthlyData).sort((a, b) => {
    return a.month.localeCompare(b.month);
  });

  // Calculate price evolution with station and fuel type filters
  const priceData = [...filteredPurchases]
    .filter(purchase => {
      const matchesStation = selectedStation === 'all' || purchase.stationName === selectedStation;
      const matchesFuelType = selectedFuelType === 'all' || purchase.fuelType === selectedFuelType;
      return matchesStation && matchesFuelType;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(purchase => ({
      date: format(new Date(purchase.date), 'dd/MM/yy'),
      prix: purchase.pricePerLiter,
      fullDate: new Date(purchase.date),
      station: purchase.stationName,
      fuelType: purchase.fuelType,
      unit: '€/L'
    }));

  // Calculate spending by vehicle (including electric charges) - use filtered data for selected period
  const vehicleSpendingData = vehicles
    .filter(vehicle => selectedVehicles.includes(vehicle.id))
    .map(vehicle => {
      const vehiclePurchases = filteredPurchases.filter(p => p.vehicleId === vehicle.id);
      const vehicleCharges = filteredElectricCharges.filter(c => c.vehicleId === vehicle.id);
      const totalFuel = vehiclePurchases.reduce((sum, p) => sum + p.totalPrice, 0);
      const totalElectric = vehicleCharges.reduce((sum, c) => sum + c.totalPrice, 0);
      const total = totalFuel + totalElectric;
      
      return {
        name: vehicle.name,
        value: total,
        id: vehicle.id,
        fuelSpent: totalFuel,
        electricSpent: totalElectric
      };
    })
    .filter(v => v.value > 0);

  // Calculate station statistics (including electric stations)
  const stationData: Record<string, { name: string, count: number, total: number }> = {};
  
  filteredPurchases.forEach(purchase => {
    const stationName = purchase.stationName;
    
    if (!stationData[stationName]) {
      stationData[stationName] = {
        name: stationName,
        count: 0,
        total: 0
      };
    }
    
    stationData[stationName].count += 1;
    stationData[stationName].total += purchase.totalPrice;
  });

  // Add electric charges to station statistics
  filteredElectricCharges.forEach(charge => {
    const stationName = charge.stationName;
    
    if (!stationData[stationName]) {
      stationData[stationName] = {
        name: stationName,
        count: 0,
        total: 0
      };
    }
    
    stationData[stationName].count += 1;
    stationData[stationName].total += charge.totalPrice;
  });
  
  // Convert to array and sort by visit count
  const stationStats = Object.values(stationData)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate electric charges statistics
  const electricChargeData = [...filteredElectricCharges]
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map(charge => ({
    date: format(new Date(charge.date), 'dd/MM/yy'),
    prix: charge.pricePerKwh,
    fullDate: new Date(charge.date),
    station: charge.stationName,
    unit: '€/kWh',
    energie: charge.energyAmount
  }));

  // Colors for charts
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#FF8042', '#00C49F', '#FFBB28'];

  const noDataMessage = (
    <div className="flex items-center justify-center h-60 text-muted-foreground">
      Pas assez de données pour afficher le graphique
    </div>
  );

  // Custom tooltip for monthly spending chart
  const CustomMonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalFuel = payload.find((p: any) => p.dataKey === 'totalFuel')?.value || 0;
      const totalElectric = payload.find((p: any) => p.dataKey === 'totalElectric')?.value || 0;
      const total = totalFuel + totalElectric;
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-gray-900">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'hsl(var(--primary))' }}></span>
              Carburant: {totalFuel.toFixed(2)} €
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'hsl(142, 69%, 58%)' }}></span>
              Électrique: {totalElectric.toFixed(2)} €
            </p>
            <hr className="my-2" />
            <p className="text-sm font-semibold">
              Total: {total.toFixed(2)} €
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  console.log('Kilometers data:', { totalKilometers, kmByVehicleData, kmByVehiclePie, vehicleKilometers });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">Visualisez vos dépenses en carburant et électrique</p>
        </div>
        
        <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-wrap gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les stations</SelectItem>
              {stationNames.map((station) => (
                <SelectItem key={station} value={station}>
                  {station}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Sélection des véhicules</CardTitle>
          <CardDescription>
            Choisissez les véhicules à comparer dans les statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllVehicles}
                className="text-sm text-primary hover:underline"
              >
                Tout sélectionner
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={handleDeselectAllVehicles}
                className="text-sm text-primary hover:underline"
              >
                Tout désélectionner
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={vehicle.id}
                    checked={selectedVehicles.includes(vehicle.id)}
                    onCheckedChange={() => handleVehicleToggle(vehicle.id)}
                  />
                  <label
                    htmlFor={vehicle.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {vehicle.name}
                  </label>
                </div>
              ))}
            </div>
            {selectedVehicles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedVehicles.length} véhicule(s) sélectionné(s)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carburant</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPurchases.reduce((sum, p) => sum + p.totalPrice, 0).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPurchases.reduce((sum, p) => sum + p.quantity, 0).toFixed(1)} L
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Électrique</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredElectricCharges.reduce((sum, c) => sum + c.totalPrice, 0).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredElectricCharges.reduce((sum, c) => sum + c.energyAmount, 0).toFixed(1)} kWh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kilomètres</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKilometers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              kilomètres parcourus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recharges</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredElectricCharges.length}</div>
            <p className="text-xs text-muted-foreground">
              sessions de recharge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pleins</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPurchases.length}</div>
            <p className="text-xs text-muted-foreground">
              achats de carburant
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dépenses Mensuelles</CardTitle>
            <CardDescription>
              {selectedVehicles.length === vehicles.length
                ? 'Dépenses mensuelles pour tous les véhicules (carburant + électrique)' 
                : `Dépenses mensuelles pour les véhicules sélectionnés (carburant + électrique)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlySpendingData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySpendingData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(value) => `${value} €`}
                    />
                    <Tooltip content={<CustomMonthlyTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="totalFuel" 
                      stackId="a"
                      fill="hsl(var(--primary))" 
                      radius={[0, 0, 0, 0]} 
                      maxBarSize={60}
                      name="Carburant"
                    />
                    <Bar 
                      dataKey="totalElectric" 
                      stackId="a"
                      fill="hsl(142, 69%, 58%)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={60}
                      name="Électrique"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : noDataMessage}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kilomètres par Véhicule</CardTitle>
            <CardDescription>
              {selectedVehicles.length === vehicles.length
                ? 'Kilomètres parcourus par véhicule'
                : `Kilomètres parcourus pour les véhicules sélectionnés`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kmByVehicleData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kmByVehicleData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(value) => `${value} km`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} km`, 'Kilomètres']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',  
                        color: 'hsl(222.2, 84%, 4.9%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                    <Bar 
                      dataKey="kilometers" 
                      fill="hsl(var(--accent))" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : noDataMessage}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution Prix Électrique</CardTitle>
            <CardDescription>
              Évolution du prix du kWh pour les recharges électriques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {electricChargeData.length > 1 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={electricChargeData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                    />
                     <YAxis 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(value) => `${value.toFixed(3)} €`}
                      domain={['auto', 'auto']}
                    />
                     <Tooltip
                      formatter={(value: number) => [`${value.toFixed(3)} €/kWh`, 'Prix']}
                      labelFormatter={(label) => {
                        const dataPoint = electricChargeData.find(p => p.date === label);
                        if (dataPoint) {
                          return `${format(dataPoint.fullDate, 'dd MMMM yyyy', { locale: fr })} - ${dataPoint.station}`;
                        }
                        return label;
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(222.2, 84%, 4.9%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                     <Line
                      type="monotone"
                      dataKey="prix"
                      stroke="hsl(142, 69%, 58%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(142, 69%, 58%)', strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: 'hsl(142, 69%, 58%)', strokeWidth: 0, r: 6 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : noDataMessage}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kilomètres par Véhicule</CardTitle>
            <CardDescription>
              Répartition des kilomètres parcourus par véhicule
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kmByVehiclePie.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kmByVehiclePie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {kmByVehiclePie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} km`, 'Kilomètres']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(222.2, 84%, 4.9%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : noDataMessage}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Évolution des Prix</CardTitle>
              <CardDescription>
                Évolution du prix au litre par type de carburant
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type de carburant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {fuelTypes.map((fuelType) => (
                    <SelectItem key={fuelType} value={fuelType}>
                      {fuelType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les stations</SelectItem>
                  {stationNames.map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {priceData.length > 1 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={priceData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                    />
                     <YAxis 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(value) => `${value.toFixed(3)} €`}
                      domain={['auto', 'auto']}
                    />
                     <Tooltip
                      formatter={(value: number) => [`${value.toFixed(3)} €/L`, 'Prix']}
                      labelFormatter={(label) => {
                        const dataPoint = priceData.find(p => p.date === label);
                        if (dataPoint) {
                          return `${format(dataPoint.fullDate, 'dd MMMM yyyy', { locale: fr })} - ${dataPoint.fuelType}${selectedStation === 'all' ? ` - ${dataPoint.station}` : ''}`;
                        }
                        return label;
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(222.2, 84%, 4.9%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                     <Line
                      type="monotone"
                      dataKey="prix"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 6 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : noDataMessage}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Véhicule</CardTitle>
            <CardDescription>
              Dépenses totales par véhicule (carburant + électrique)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vehicleSpendingData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleSpendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleSpendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                     <Tooltip
                      formatter={(value: number) => [`${value.toFixed(2)} €`, 'Total']}
                      labelFormatter={(label) => {
                        const vehicle = vehicleSpendingData.find(v => v.name === label);
                        return vehicle ? `${label} (Carburant: ${vehicle.fuelSpent.toFixed(2)}€, Électrique: ${vehicle.electricSpent.toFixed(2)}€)` : label;
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(222.2, 84%, 4.9%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                     <Legend 
                       wrapperStyle={{ 
                         paddingTop: '20px',
                         fontSize: '12px'
                       }}
                     />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : noDataMessage}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stations-service les plus visitées</CardTitle>
            <CardDescription>
              Top 5 des stations les plus fréquentées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stationStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={stationStats}
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                    <XAxis 
                      type="number"
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={{ stroke: 'var(--border)' }}
                      width={100}
                    />
                     <Tooltip
                      formatter={(value: number) => [`${value} visites`, 'Fréquence']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(222.2, 84%, 4.9%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--accent))" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : noDataMessage}
          </CardContent>
        </Card>
      </div>

      {filteredPurchases.length === 0 && filteredElectricCharges.length === 0 && (
        <Card>
          <CardContent className="flex items-center p-6">
            <Info className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune donnée disponible pour le moment. Ajoutez des achats de carburant ou des recharges électriques pour voir les statistiques.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Statistics;
