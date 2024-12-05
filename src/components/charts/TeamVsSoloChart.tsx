import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface TeamVsSoloChartProps {
  data: {
    name: string;
    soloKDA: number;
    teamKDA: number;
  }[];
}

export const TeamVsSoloChart = ({ data }: TeamVsSoloChartProps) => {
  const chartConfig = {
    soloKDA: {
      color: "#f472b6",
      label: "Solo Performance"
    },
    teamKDA: {
      color: "#818cf8",
      label: "Team Performance"
    }
  };

  return (
    <div className="p-4 bg-gaming-card rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Team vs Solo Performance</h3>
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 rounded border border-gray-300 text-black">
                    <p className="font-semibold text-gray-800">{data.name}</p>
                    <p className="text-gray-700">Solo KDA: {data.soloKDA}</p>
                    <p className="text-gray-700">Team KDA: {data.teamKDA}</p>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar dataKey="soloKDA" name="Solo KDA" fill={chartConfig.soloKDA.color} />
            <Bar dataKey="teamKDA" name="Team KDA" fill={chartConfig.teamKDA.color} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};