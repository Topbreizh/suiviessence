
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
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { format, getMonth, getYear } from 'date-fns';
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
  const [selectedVehicle, setSelectedVehicle] = useState<string | 'all'>('all');
  const [selectedStation, setSelectedStation] = useState<string | 'all'>('all');
  const [selectedFuelType, setSelectedFuelType] = useState<string | 'all'>('all');
  const [kmPeriod, setKmPeriod] = useState<'month' | 'year'>('month');

  // Fetch data on component mount
  useEffect(() => {
    console.log('Fetching data...');
    fetchFuelPurchases();
    fetchVehicles();
    fetchElectricCharges();
  }, [fetchFuelPurchases, fetchVehicles, fetchElectricCharges]);

  // Filter purchases by selected vehicle
  const filteredPurchases = selectedVehicle === 'all'
    ? fuelPurchases
    : fuelPurchases.filter(p => p.vehicleId === selectedVehicle);

  // Get vehicle name by id
  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Véhicule inconnu';
  };

  // Get all unique station names and fuel types
  const stationNames = Array.from(
    new Set(fuelPurchases.map(p => p.stationName))
  ).filter(Boolean).sort();

  const fuelTypes = Array.from(
    new Set(fuelPurchases.map(p => p.fuelType))
  ).filter(Boolean).sort();

  // Calculate total kilometers driven
  const totalKilometers = filteredPurchases.reduce((sum, purchase) => {
    return sum + (purchase.kilometers || 0);
  }, 0);

  // Calculate kilometers by period
  const kmByPeriod: Record<string, { period: string, kilometers: number, label: string }> = {};
  
  filteredPurchases.forEach(purchase => {
    if (!purchase.kilometers) return;
    
    const date = new Date(purchase.date);
    let periodKey: string;
    let periodLabel: string;
    
    if (kmPeriod === 'month') {
      periodKey = format(date, 'MM/yyyy');
      periodLabel = format(date, 'MMM yyyy', { locale: fr });
    } else {
      periodKey = format(date, 'yyyy');
      periodLabel = format(date, 'yyyy');
    }
    
    if (!kmByPeriod[periodKey]) {
      kmByPeriod[periodKey] = {
        period: periodKey,
        kilometers: 0,
        label: periodLabel
      };
    }
    
    kmByPeriod[periodKey].kilometers += purchase.kilometers;
  });

  const kmData = Object.values(kmByPeriod).sort((a, b) => a.period.localeCompare(b.period));

  // Calculate kilometers by vehicle
  const kmByVehicle = vehicles.map(vehicle => {
    const vehiclePurchases = fuelPurchases.filter(p => p.vehicleId === vehicle.id);
    const totalKm = vehiclePurchases.reduce((sum, p) => sum + (p.kilometers || 0), 0);
    
    return {
      name: vehicle.name,
      value: totalKm,
      id: vehicle.id
    };
  }).filter(v => v.value > 0);

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

  // Add electric charges (filter by vehicle if selected)
  const filteredElectricCharges = selectedVehicle === 'all'
    ? electricCharges
    : electricCharges.filter(c => c.vehicleId === selectedVehicle);

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

  // Calculate spending by vehicle (including electric charges)
  const vehicleSpendingData = vehicles.map(vehicle => {
    const vehiclePurchases = fuelPurchases.filter(p => p.vehicleId === vehicle.id);
    const vehicleCharges = electricCharges.filter(c => c.vehicleId === vehicle.id);
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
  }).filter(v => v.value > 0);

  // Calculate station statistics
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

  console.log('Kilometers data:', { totalKilometers, kmData, kmByVehicle });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">Visualisez vos dépenses en carburant et électrique</p>
        </div>
        
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Tous les véhicules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les véhicules</SelectItem>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
              {selectedVehicle === 'all' 
                ? 'Dépenses mensuelles pour tous les véhicules (carburant + électrique)' 
                : `Dépenses mensuelles pour ${getVehicleName(selectedVehicle)} (carburant + électrique)`}
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
                     <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'totalFuel') return [`${value.toFixed(2)} €`, 'Carburant'];
                        if (name === 'totalElectric') return [`${value.toFixed(2)} €`, 'Électrique'];
                        return [`${value.toFixed(2)} €`, 'Total'];
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        color: 'hsl(222.2, 84%, 4.9%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Kilomètres Parcourus</CardTitle>
              <CardDescription>
                {selectedVehicle === 'all' 
                  ? `Kilomètres parcourus par ${kmPeriod === 'month' ? 'mois' : 'année'} pour tous les véhicules`
                  : `Kilomètres parcourus par ${kmPeriod === 'month' ? 'mois' : 'année'} pour ${getVehicleName(selectedVehicle)}`}
              </CardDescription>
            </div>
            <Select value={kmPeriod} onValueChange={(value: 'month' | 'year') => setKmPeriod(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Par mois</SelectItem>
                <SelectItem value="year">Par année</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {kmData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kmData}
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
                      tickFormatter={(value) => `${value} km`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value} km`, 'Kilomètres']}
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
            {kmByVehicle.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kmByVehicle}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {kmByVehicle.map((entry, index) => (
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
