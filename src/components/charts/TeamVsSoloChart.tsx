import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";
import { StatTooltip } from "../analytics/StatTooltip";
import { getTooltipDescriptions } from "@/utils/kdaCalculations";
import { SortOption } from "@/utils/sortingUtils";
import { Card } from "@/components/ui/card";

interface TeamVsSoloChartProps {
  data: {
    name: string;
    soloKDA: number;
    teamKDA: number;
    totalKDA: number;
    kdSpread: number;
  }[];
  sortOption: SortOption;
}

export const TeamVsSoloChart = ({ data, sortOption }: TeamVsSoloChartProps) => {
  const tooltips = getTooltipDescriptions();

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">Team vs Solo Performance</h3>
        <StatTooltip {...tooltips.teamSolo} />
      </div>
      <div className="h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer>
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
            >
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <p className="font-semibold">{data.name}</p>
                      <p>Solo KDA: {data.soloKDA}</p>
                      <p>Team KDA: {data.teamKDA}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="soloKDA" name="Solo KDA" className="fill-primary" />
              <Bar dataKey="teamKDA" name="Team KDA" className="fill-secondary" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};