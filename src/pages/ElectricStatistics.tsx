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
import { Info, Zap, Gauge, MapPin, Battery, Bolt } from 'lucide-react';

const ElectricStatistics = () => {
  const { 
    electricCharges, 
    vehicles, 
    fetchElectricCharges, 
    fetchVehicles 
  } = useStore();
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<string | 'all'>('all');

  // Fetch data on component mount
  useEffect(() => {
    fetchElectricCharges();
    fetchVehicles();
  }, [fetchElectricCharges, fetchVehicles]);

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
    new Set(electricCharges.map(c => getYear(new Date(c.date))))
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
  const filteredElectricCharges = filterByDateRange(
    selectedVehicles.length === 0
      ? electricCharges
      : electricCharges.filter(c => selectedVehicles.includes(c.vehicleId))
  );

  // Get vehicle name by id
  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Véhicule inconnu';
  };

  // Get all unique station names
  const stationNames = Array.from(
    new Set(electricCharges.map(c => c.stationName))
  ).filter(Boolean).sort();

  // Calculate monthly spending
  const monthlyData: Record<string, { month: string, total: number, kwh: number, label: string, sessions: number }> = {};
  
  filteredElectricCharges.forEach(charge => {
    const date = new Date(charge.date);
    const monthYear = format(date, 'MM/yyyy');
    const monthLabel = format(date, 'MMM yyyy', { locale: fr });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        total: 0,
        kwh: 0,
        label: monthLabel,
        sessions: 0
      };
    }
    
    monthlyData[monthYear].total += charge.totalPrice;
    monthlyData[monthYear].kwh += charge.energyAmount;
    monthlyData[monthYear].sessions += 1;
  });
  
  // Convert to array and sort by date
  const monthlySpendingData = Object.values(monthlyData).sort((a, b) => {
    return a.month.localeCompare(b.month);
  });

  // Calculate price evolution
  const priceData = [...filteredElectricCharges]
    .filter(charge => {
      const matchesStation = selectedStation === 'all' || charge.stationName === selectedStation;
      return matchesStation;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(charge => ({
      date: format(new Date(charge.date), 'dd/MM/yy'),
      prix: charge.pricePerKwh,
      fullDate: new Date(charge.date),
      station: charge.stationName,
      unit: '€/kWh'
    }));

  // Calculate spending by vehicle
  const vehicleSpendingData = vehicles
    .filter(vehicle => selectedVehicles.includes(vehicle.id))
    .map(vehicle => {
      const vehicleCharges = filteredElectricCharges.filter(c => c.vehicleId === vehicle.id);
      const total = vehicleCharges.reduce((sum, c) => sum + c.totalPrice, 0);
      const kwh = vehicleCharges.reduce((sum, c) => sum + c.energyAmount, 0);
      
      return {
        name: vehicle.name,
        value: total,
        kwh: kwh,
        sessions: vehicleCharges.length,
        id: vehicle.id
      };
    })
    .filter(v => v.value > 0);

  // Calculate station statistics
  const stationData: Record<string, { name: string, count: number, total: number, kwh: number }> = {};
  
  filteredElectricCharges.forEach(charge => {
    const stationName = charge.stationName;
    
    if (!stationData[stationName]) {
      stationData[stationName] = {
        name: stationName,
        count: 0,
        total: 0,
        kwh: 0
      };
    }
    
    stationData[stationName].count += 1;
    stationData[stationName].total += charge.totalPrice;
    stationData[stationName].kwh += charge.energyAmount;
  });
  
  // Convert to array and sort by visit count
  const stationStats = Object.values(stationData)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Colors for charts
  const COLORS = ['hsl(142, 69%, 58%)', 'hsl(var(--secondary))', '#FF8042', '#00C49F', '#FFBB28'];

  const noDataMessage = (
    <div className="flex items-center justify-center h-60 text-muted-foreground">
      Pas assez de données pour afficher le graphique
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques Électriques</h1>
          <p className="text-muted-foreground">Visualisez vos recharges et dépenses électriques</p>
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
            Choisissez les véhicules électriques à analyser
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredElectricCharges.reduce((sum, c) => sum + c.totalPrice, 0).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredElectricCharges.length} recharge(s)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Énergie Totale</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredElectricCharges.reduce((sum, c) => sum + c.energyAmount, 0).toFixed(1)} kWh
            </div>
            <p className="text-xs text-muted-foreground">
              Consommée au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix Moyen</CardTitle>
            <Bolt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredElectricCharges.length > 0 
                ? (filteredElectricCharges.reduce((sum, c) => sum + c.pricePerKwh, 0) / filteredElectricCharges.length).toFixed(3)
                : '0.000'
              } €/kWh
            </div>
            <p className="text-xs text-muted-foreground">
              Par kilowattheure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stations Utilisées</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stationNames.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Stations différentes
            </p>
          </CardContent>
        </Card>
      </div>

      {filteredElectricCharges.length === 0 ? (
        <Card>
          <CardContent className="flex items-center p-6">
            <Info className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune donnée de recharge électrique disponible pour le moment. Ajoutez des recharges pour voir les statistiques.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Dépenses Mensuelles */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dépenses Mensuelles</CardTitle>
                <CardDescription>Évolution des coûts de recharge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {monthlySpendingData.length === 0 ? noDataMessage : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlySpendingData}>
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
                        <Tooltip 
                          formatter={(value: any, name: string) => [`${value.toFixed(2)} €`, 'Dépense']}
                          labelStyle={{ color: 'var(--foreground)' }}
                          contentStyle={{ 
                            backgroundColor: 'var(--background)', 
                            border: '1px solid var(--border)',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar 
                          dataKey="total" 
                          fill="hsl(142, 69%, 58%)" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consommation Mensuelle</CardTitle>
                <CardDescription>Énergie consommée par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {monthlySpendingData.length === 0 ? noDataMessage : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlySpendingData}>
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
                          tickFormatter={(value) => `${value} kWh`}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => [`${value.toFixed(1)} kWh`, 'Consommation']}
                          labelStyle={{ color: 'var(--foreground)' }}
                          contentStyle={{ 
                            backgroundColor: 'var(--background)', 
                            border: '1px solid var(--border)',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar 
                          dataKey="kwh" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Évolution du prix et répartition par véhicule */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Évolution du Prix</CardTitle>
                <CardDescription>Prix par kWh au fil du temps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {priceData.length === 0 ? noDataMessage : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
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
                          tickFormatter={(value) => `${value} €`}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => [`${value.toFixed(3)} €/kWh`, 'Prix']}
                          labelStyle={{ color: 'var(--foreground)' }}
                          contentStyle={{ 
                            backgroundColor: 'var(--background)', 
                            border: '1px solid var(--border)',
                            borderRadius: '6px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="prix" 
                          stroke="hsl(142, 69%, 58%)" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(142, 69%, 58%)', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Véhicule</CardTitle>
                <CardDescription>Dépenses de recharge par véhicule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {vehicleSpendingData.length === 0 ? noDataMessage : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vehicleSpendingData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toFixed(0)} €`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {vehicleSpendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(2)} €`, 'Dépense']}
                          labelStyle={{ color: 'var(--foreground)' }}
                          contentStyle={{ 
                            backgroundColor: 'var(--background)', 
                            border: '1px solid var(--border)',
                            borderRadius: '6px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques des stations */}
          {stationStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Stations de Recharge</CardTitle>
                <CardDescription>Stations les plus utilisées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stationStats.map((station, index) => (
                    <div key={station.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {station.count} recharge(s) • {station.kwh.toFixed(1)} kWh
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{station.total.toFixed(2)} €</p>
                        <p className="text-sm text-muted-foreground">
                          {(station.total / station.kwh).toFixed(3)} €/kWh
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ElectricStatistics;