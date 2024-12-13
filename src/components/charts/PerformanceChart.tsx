import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { StatTooltip } from "../analytics/StatTooltip";
import { getTooltipDescriptions } from "@/utils/kdaCalculations";

interface PerformanceChartProps {
  data: Array<{
    name: string;
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
  }>;
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  const tooltips = getTooltipDescriptions();

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">Average Performance Metrics</h3>
        <StatTooltip {...tooltips.performance} />
      </div>
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
            <Bar dataKey="avgKills" name="Avg Kills" fill="hsl(var(--primary))" />
            <Bar dataKey="avgDeaths" name="Avg Deaths" fill="hsl(var(--secondary))" />
            <Bar dataKey="avgAssists" name="Avg Assists" fill="hsl(var(--accent))" />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};