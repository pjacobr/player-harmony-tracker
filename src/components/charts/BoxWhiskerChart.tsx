import { BarChart, Bar, ComposedChart, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
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
    box: {
      color: "#4ade80",
      label: "Performance Distribution"
    }
  };

  // Transform data for the box plot visualization
  const transformedData = data.map(item => ({
    name: item.name,
    // IQR box
    q1ToQ3: item.q3 - item.q1,
    q1: item.q1,
    // Whiskers
    minToQ1: item.q1 - item.min,
    q3ToMax: item.max - item.q3,
    // Reference points
    min: item.min,
    median: item.median,
    max: item.max
  }));

  return (
    <div className="p-4 bg-gaming-card rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Performance Distribution</h3>
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <ComposedChart
            data={transformedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-background p-2 rounded border">
                  <p className="font-semibold">{data.name}</p>
                  <p>Maximum: {data.max}</p>
                  <p>Upper Quartile: {data.q1 + data.q1ToQ3}</p>
                  <p>Median: {data.median}</p>
                  <p>Lower Quartile: {data.q1}</p>
                  <p>Minimum: {data.min}</p>
                </div>
              );
            }} />
            <Legend />
            {/* IQR Box */}
            <Bar
              dataKey="q1ToQ3"
              stackId="box"
              fill={chartConfig.box.color}
              baseValue="q1"
              isAnimationActive={false}
            />
            {/* Lower whisker */}
            <Bar
              dataKey="minToQ1"
              stackId="lowerWhisker"
              fill="transparent"
              stroke={chartConfig.box.color}
              strokeWidth={2}
              baseValue="min"
              isAnimationActive={false}
            />
            {/* Upper whisker */}
            <Bar
              dataKey="q3ToMax"
              stackId="upperWhisker"
              fill="transparent"
              stroke={chartConfig.box.color}
              strokeWidth={2}
              baseValue={() => 0}
              isAnimationActive={false}
            />
            {/* Median line */}
            <Line
              type="monotone"
              dataKey="median"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
};