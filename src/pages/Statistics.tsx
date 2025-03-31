
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
  const { fuelPurchases, vehicles } = useStore();
  const [selectedVehicle, setSelectedVehicle] = useState<string | 'all'>('all');

  // Filter purchases by selected vehicle
  const filteredPurchases = selectedVehicle === 'all'
    ? fuelPurchases
    : fuelPurchases.filter(p => p.vehicleId === selectedVehicle);

  // Get vehicle name by id
  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Véhicule inconnu';
  };

  // Calculate monthly spending
  const monthlyData: Record<string, { month: string, total: number, liters: number, label: string }> = {};
  
  filteredPurchases.forEach(purchase => {
    const date = new Date(purchase.date);
    const monthYear = format(date, 'MM/yyyy');
    const monthLabel = format(date, 'MMM yyyy', { locale: fr });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        total: 0,
        liters: 0,
        label: monthLabel
      };
    }
    
    monthlyData[monthYear].total += purchase.totalPrice;
    monthlyData[monthYear].liters += purchase.quantity;
  });
  
  // Convert to array and sort by date
  const monthlySpendingData = Object.values(monthlyData).sort((a, b) => {
    return a.month.localeCompare(b.month);
  });

  // Calculate price evolution
  const priceData = [...filteredPurchases]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(purchase => ({
      date: format(new Date(purchase.date), 'dd/MM/yy'),
      prix: purchase.pricePerLiter,
      fullDate: new Date(purchase.date)
    }));

  // Calculate spending by vehicle
  const vehicleSpendingData = vehicles.map(vehicle => {
    const vehiclePurchases = fuelPurchases.filter(p => p.vehicleId === vehicle.id);
    const total = vehiclePurchases.reduce((sum, p) => sum + p.totalPrice, 0);
    
    return {
      name: vehicle.name,
      value: total,
      id: vehicle.id
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
                      formatter={(value: number) => [`${value.toFixed(2)} €`, 'Total']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--card-foreground)'
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(var(--primary))" 
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
            <CardTitle>Évolution des Prix</CardTitle>
            <CardDescription>
              Évolution du prix au litre
            </CardDescription>
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
                      tickFormatter={(value) => `${value.toFixed(2)} €`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(3)} €/L`, 'Prix']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--card-foreground)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="prix"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: 'hsl(var(--secondary))', strokeWidth: 0, r: 6 }}
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
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--card-foreground)'
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
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--card-foreground)'
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

      {filteredPurchases.length === 0 && (
        <Card>
          <CardContent className="flex items-center p-6">
            <Info className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune donnée disponible pour le moment. Ajoutez des achats de carburant pour voir les statistiques.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Statistics;
