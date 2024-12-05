import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

interface PerformanceChartProps {
  data: Array<{
    name: string;
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
  }>;
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  return (
    <Card className="p-4 bg-gaming-card">
      <h3 className="text-xl font-bold mb-4 text-gaming-accent">Average Performance Metrics</h3>
      <div className="h-[300px]">
        <ChartContainer config={{}}>
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              interval={0}
            />
            <YAxis />
            <ChartTooltip />
            <Legend />
            <Bar dataKey="avgKills" fill="#4F46E5" name="Avg Kills" />
            <Bar dataKey="avgDeaths" fill="#DC2626" name="Avg Deaths" />
            <Bar dataKey="avgAssists" fill="#2563EB" name="Avg Assists" />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};