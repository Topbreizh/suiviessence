
import { FuelPurchase } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FuelPriceChartProps {
  purchases: FuelPurchase[];
}

const FuelPriceChart = ({ purchases }: FuelPriceChartProps) => {
  // Sort purchases by date
  const sortedPurchases = [...purchases].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Format data for chart
  const data = sortedPurchases.map(purchase => ({
    date: format(new Date(purchase.date), 'dd MMM', { locale: fr }),
    prix: purchase.pricePerLiter,
    fullDate: new Date(purchase.date)
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
          tickFormatter={(value) => `${value} €`}
          domain={['auto', 'auto']}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(3)} €/L`, 'Prix']}
          labelFormatter={(label: string, items: any[]) => {
            const dataPoint = items[0]?.payload;
            if (dataPoint) {
              return format(dataPoint.fullDate, 'dd MMMM yyyy', { locale: fr });
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
  );
};

export default FuelPriceChart;
