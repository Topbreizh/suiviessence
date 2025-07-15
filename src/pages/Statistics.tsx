
import { useState } from 'react';
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
import { Info, MapPin } from 'lucide-react';

const Statistics = () => {
  const { fuelPurchases, vehicles, electricCharges } = useStore();
  const [selectedVehicle, setSelectedVehicle] = useState<string | 'all'>('all');
  const [selectedStation, setSelectedStation] = useState<string | 'all'>('all');
  const [selectedEnergyType, setSelectedEnergyType] = useState<'all' | 'fuel' | 'electric'>('all');

  // Filter purchases by selected vehicle
  const filteredPurchases = selectedVehicle === 'all'
    ? fuelPurchases
    : fuelPurchases.filter(p => p.vehicleId === selectedVehicle);

  // Get vehicle name by id
  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Véhicule inconnu';
  };

  // Get all unique station names
  const stationNames = Array.from(
    new Set(fuelPurchases.map(p => p.stationName))
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

  // Calculate price evolution with station and energy type filters
  let priceData: any[] = [];

  if (selectedEnergyType === 'all' || selectedEnergyType === 'fuel') {
    const fuelData = [...filteredPurchases]
      .filter(purchase => selectedStation === 'all' || purchase.stationName === selectedStation)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(purchase => ({
        date: format(new Date(purchase.date), 'dd/MM/yy'),
        prix: purchase.pricePerLiter,
        fullDate: new Date(purchase.date),
        station: purchase.stationName,
        type: 'Carburant',
        unit: '€/L'
      }));
    
    if (selectedEnergyType === 'fuel') {
      priceData = fuelData;
    } else {
      priceData.push(...fuelData);
    }
  }

  if (selectedEnergyType === 'all' || selectedEnergyType === 'electric') {
    const filteredElectricCharges = selectedVehicle === 'all'
      ? electricCharges
      : electricCharges.filter(c => c.vehicleId === selectedVehicle);
    
    const electricData = [...filteredElectricCharges]
      .filter(charge => selectedStation === 'all' || charge.stationName === selectedStation)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(charge => ({
        date: format(new Date(charge.date), 'dd/MM/yy'),
        prix: charge.energyAmount > 0 ? charge.totalPrice / charge.energyAmount : 0,
        fullDate: new Date(charge.date),
        station: charge.stationName,
        type: 'Électrique',
        unit: '€/kWh'
      }));
    
    if (selectedEnergyType === 'electric') {
      priceData = electricData;
    } else {
      priceData.push(...electricData);
    }
  }

  // Sort all data by date
  priceData.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

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

  // Colors for charts
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#FF8042', '#00C49F', '#FFBB28'];

  const noDataMessage = (
    <div className="flex items-center justify-center h-60 text-muted-foreground">
      Pas assez de données pour afficher le graphique
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">Visualisez vos dépenses en carburant</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dépenses Mensuelles</CardTitle>
            <CardDescription>
              {selectedVehicle === 'all' 
                ? 'Dépenses mensuelles pour tous les véhicules' 
                : `Dépenses mensuelles pour ${getVehicleName(selectedVehicle)}`}
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
                      fill="hsl(var(--secondary))" 
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
              <CardTitle>Évolution des Prix</CardTitle>
              <CardDescription>
                Évolution du prix par unité d'énergie
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedEnergyType} onValueChange={(value: 'all' | 'fuel' | 'electric') => setSelectedEnergyType(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type d'énergie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="fuel">Carburant</SelectItem>
                  <SelectItem value="electric">Électrique</SelectItem>
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
                      formatter={(value: number, name: string, props: any) => {
                        const dataPoint = props.payload;
                        return [`${value.toFixed(3)} ${dataPoint.unit}`, dataPoint.type];
                      }}
                      labelFormatter={(label) => {
                        const dataPoint = priceData.find(p => p.date === label);
                        if (dataPoint) {
                          return `${format(dataPoint.fullDate, 'dd MMMM yyyy', { locale: fr })}${selectedStation === 'all' ? ` - ${dataPoint.station}` : ''}`;
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
                      stroke={selectedEnergyType === 'electric' ? 'hsl(var(--secondary))' : selectedEnergyType === 'fuel' ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                      strokeWidth={2}
                      dot={{ fill: selectedEnergyType === 'electric' ? 'hsl(var(--secondary))' : selectedEnergyType === 'fuel' ? 'hsl(var(--primary))' : 'hsl(var(--accent))', strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: selectedEnergyType === 'electric' ? 'hsl(var(--secondary))' : selectedEnergyType === 'fuel' ? 'hsl(var(--primary))' : 'hsl(var(--accent))', strokeWidth: 0, r: 6 }}
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
              Dépenses totales par véhicule
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
                    <Legend />
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
