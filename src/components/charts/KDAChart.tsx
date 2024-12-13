import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { StatTooltip } from "../analytics/StatTooltip";
import { getTooltipDescriptions } from "@/utils/kdaCalculations";
import { cn } from "@/lib/utils";
import { sortByName } from "@/utils/sortingUtils";

interface KDAChartProps {
  data: Array<{
    name: string;
    kdSpread: number;
  }>;
  sortAscending: boolean;
}

export const KDAChart = ({ data, sortAscending }: KDAChartProps) => {
  const tooltips = getTooltipDescriptions();
  
  const sortedData = [...data].sort((a, b) => sortByName(a, b, sortAscending));
  
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
          <BarChart data={sortedData}>
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              interval={0}
              stroke="currentColor"
            />
            <YAxis stroke="currentColor" />
            <ChartTooltip />
            <Legend />
            <Bar 
              dataKey="kdSpread" 
              name="K/D Spread"
              fill="currentColor"
              className={cn(
                "[&_.recharts-rectangle]:fill-emerald-500 dark:[&_.recharts-rectangle]:fill-emerald-400",
                "[&_.recharts-rectangle[height^='-']]:fill-red-500 dark:[&_.recharts-rectangle[height^='-']]:fill-red-400"
              )}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};