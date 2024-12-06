import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface KDAChartProps {
  data: Array<{
    name: string;
    kda: number;
  }>;
}

export const KDAChart = ({ data }: KDAChartProps) => {
  return (
    <Card className="p-4 bg-gaming-card">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gaming-accent">Average KDA Ratios</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gaming-muted" />
            </TooltipTrigger>
            <TooltipContent>
              <p>KDA (Kills/Deaths/Assists) Ratio is calculated as:<br />
                (Kills + Assists) / Deaths<br />
                Higher KDA indicates better performance.</p>
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
            <Bar dataKey="kda" fill="#D946EF" name="KDA Ratio" />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};