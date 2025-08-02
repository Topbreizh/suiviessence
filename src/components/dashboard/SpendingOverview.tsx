
import { FuelPurchase } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, getMonth, getYear, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SpendingOverviewProps {
  purchases: FuelPurchase[];
  electricCharges?: any[];
}

const SpendingOverview = ({ purchases, electricCharges = [] }: SpendingOverviewProps) => {
  // Calculate monthly spending (including electric charges)
  const monthlyData: Record<string, { month: string, totalFuel: number, totalElectric: number, total: number, label: string }> = {};
  
  // Add fuel purchases
  purchases.forEach(purchase => {
    const date = new Date(purchase.date);
    const monthYear = format(date, 'MM/yyyy');
    const monthLabel = format(date, 'MMM yyyy', { locale: fr });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        totalFuel: 0,
        totalElectric: 0,
        total: 0,
        label: monthLabel
      };
    }
    
    monthlyData[monthYear].totalFuel += purchase.totalPrice;
    monthlyData[monthYear].total += purchase.totalPrice;
  });

  // Add electric charges
  electricCharges.forEach(charge => {
    const date = new Date(charge.date);
    const monthYear = format(date, 'MM/yyyy');
    const monthLabel = format(date, 'MMM yyyy', { locale: fr });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        month: monthYear,
        totalFuel: 0,
        totalElectric: 0,
        total: 0,
        label: monthLabel
      };
    }
    
    monthlyData[monthYear].totalElectric += charge.totalPrice;
    monthlyData[monthYear].total += charge.totalPrice;
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
  );
};

export default SpendingOverview;
