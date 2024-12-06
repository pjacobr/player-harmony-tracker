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
    <Card className="p-4 bg-gaming-card">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gaming-accent">Average Performance Metrics</h3>
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
              stroke="#9F9EA1"
            />
            <YAxis stroke="#9F9EA1" />
            <ChartTooltip />
            <Legend />
            <Bar dataKey="avgKills" fill="#8B5CF6" name="Avg Kills" />
            <Bar dataKey="avgDeaths" fill="#F97316" name="Avg Deaths" />
            <Bar dataKey="avgAssists" fill="#0EA5E9" name="Avg Assists" />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};