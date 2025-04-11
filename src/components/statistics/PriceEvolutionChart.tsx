
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FuelPurchase } from '@/types';

interface PriceEvolutionChartProps {
  purchases: FuelPurchase[];
  title?: string;
  description?: string;
}

const PriceEvolutionChart = ({ 
  purchases, 
  title = "Évolution des Prix", 
  description = "Évolution du prix au litre" 
}: PriceEvolutionChartProps) => {
  const [selectedStation, setSelectedStation] = useState<string | 'all'>('all');

  // Get all unique station names
  const stationNames = Array.from(
    new Set(purchases.map(p => p.stationName))
  ).filter(Boolean).sort();

  // Calculate price evolution with station filter
  const priceData = [...purchases]
    .filter(purchase => selectedStation === 'all' || purchase.stationName === selectedStation)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(purchase => ({
      date: format(new Date(purchase.date), 'dd/MM/yy'),
      prix: purchase.pricePerLiter,
      fullDate: new Date(purchase.date),
      station: purchase.stationName
    }));

  const noDataMessage = (
    <div className="flex items-center justify-center h-60 text-muted-foreground">
      Pas assez de données pour afficher le graphique
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
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
                  labelFormatter={(label) => {
                    const dataPoint = priceData.find(p => p.date === label);
                    if (dataPoint) {
                      return `${format(dataPoint.fullDate, 'dd MMMM yyyy', { locale: fr })}${selectedStation === 'all' ? ` - ${dataPoint.station}` : ''}`;
                    }
                    return label;
                  }}
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
  );
};

export default PriceEvolutionChart;
