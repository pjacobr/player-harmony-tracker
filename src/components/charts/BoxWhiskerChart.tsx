import { ResponsiveContainer, BoxPlot, ComposedChart, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { GameStats } from "@/types/gameStats";

interface BoxWhiskerChartProps {
  data: {
    name: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  }[];
}

export const BoxWhiskerChart = ({ data }: BoxWhiskerChartProps) => {
  const chartConfig = {
    kills: {
      color: "#4ade80",
      label: "Kills Distribution"
    },
    deaths: {
      color: "#f87171",
      label: "Deaths Distribution"
    },
    assists: {
      color: "#60a5fa",
      label: "Assists Distribution"
    }
  };

  return (
    <div className="p-4 bg-gaming-card rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Performance Distribution</h3>
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-background p-2 rounded border">
                  <p className="font-semibold">{data.name}</p>
                  <p>Maximum: {data.max}</p>
                  <p>Upper Quartile: {data.q3}</p>
                  <p>Median: {data.median}</p>
                  <p>Lower Quartile: {data.q1}</p>
                  <p>Minimum: {data.min}</p>
                </div>
              );
            }} />
            <Legend />
            <BoxPlot
              dataKey="kills"
              fill={chartConfig.kills.color}
              whiskerStroke={chartConfig.kills.color}
              medianStroke={chartConfig.kills.color}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
};