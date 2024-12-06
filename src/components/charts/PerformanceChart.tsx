import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

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
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gaming-accent">Average Performance Metrics</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gaming-muted" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Average metrics per game:<br />
                - Kills: Direct eliminations<br />
                - Deaths: Times eliminated<br />
                - Assists: Helped in eliminations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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