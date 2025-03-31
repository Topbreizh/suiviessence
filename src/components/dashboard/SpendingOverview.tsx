
import { FuelPurchase } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, getMonth, getYear, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SpendingOverviewProps {
  purchases: FuelPurchase[];
}

const SpendingOverview = ({ purchases }: SpendingOverviewProps) => {
  // Calculate monthly spending
  const monthlyData: Record<string, { month: string, total: number, label: string }> = {};
  
  purchases.forEach(purchase => {
    const date = new Date(purchase.date);
    const monthYear = format(date, 'MM/yyyy');
    const monthLabel = format(date, 'MMM yyyy', { locale: fr });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        total: 0,
        label: monthLabel
      };
    }
    
    monthlyData[monthYear].total += purchase.totalPrice;
  });
  
  // Convert to array and sort by date
  const data = Object.values(monthlyData).sort((a, b) => {
    const dateA = parse(a.month, 'MM/yyyy', new Date());
    const dateB = parse(b.month, 'MM/yyyy', new Date());
    return dateA.getTime() - dateB.getTime();
  });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Pas assez de données pour afficher le graphique
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
  );
};

export default SpendingOverview;
