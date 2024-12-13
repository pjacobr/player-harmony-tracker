import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { StatTooltip } from "../analytics/StatTooltip";
import { getTooltipDescriptions } from "@/utils/kdaCalculations";

interface KDAChartProps {
  data: Array<{
    name: string;
    kdSpread: number;
  }>;
}

export const KDAChart = ({ data }: KDAChartProps) => {
  const tooltips = getTooltipDescriptions();
  
  return (
    <Card className="p-4 bg-gaming-card">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gaming-accent">Average K/D Spread</h3>
        <StatTooltip 
          title="K/D Spread"
          formula="Average Kills - Average Deaths"
          description="The difference between average kills and deaths per game. A positive number means more kills than deaths on average."
        />
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
            <Bar 
              dataKey="kdSpread" 
              name="K/D Spread"
              fill={(entry) => (entry.kdSpread >= 0 ? "#22C55E" : "#EF4444")}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};