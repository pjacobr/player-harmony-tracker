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
  const chartConfig = {
    soloKDA: {
      color: "#9b87f5",
      label: "Solo Performance"
    },
    teamKDA: {
      color: "#7E69AB",
      label: "Team Performance"
    }
  };

  return (
    <Card className="p-4 bg-gaming-card">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-semibold text-gaming-accent">Team vs Solo Performance</h3>
        <StatTooltip {...tooltips.teamSolo} />
      </div>
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
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
                stroke="#9F9EA1"
                interval={0}
              />
              <YAxis stroke="#9F9EA1" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gaming-card p-2 rounded border border-gaming-accent">
                      <p className="font-semibold text-gaming-accent">{data.name}</p>
                      <p className="text-gray-300">Solo KDA: {data.soloKDA}</p>
                      <p className="text-gray-300">Team KDA: {data.teamKDA}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="soloKDA" name="Solo KDA" fill={chartConfig.soloKDA.color} />
              <Bar dataKey="teamKDA" name="Team KDA" fill={chartConfig.teamKDA.color} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};