import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { StatTooltip } from "../analytics/StatTooltip";
import { getTooltipDescriptions } from "@/utils/kdaCalculations";

interface KDAChartProps {
  data: Array<{
    name: string;
    kda: number;
  }>;
}

export const KDAChart = ({ data }: KDAChartProps) => {
  const tooltips = getTooltipDescriptions();
  
  return (
    <Card className="p-4 bg-gaming-card">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gaming-accent">Average KDA Ratios</h3>
        <StatTooltip {...tooltips.kda} />
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
            <Bar dataKey="kda" fill="#D946EF" name="KDA Ratio" />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};