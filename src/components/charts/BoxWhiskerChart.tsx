import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { BoxWhiskerData } from "./types/chartTypes";
import { transformBoxWhiskerData } from "./utils/dataTransforms";
import { MedianLine } from "./shapes/MedianLine";
import { WhiskerLine } from "./shapes/WhiskerLine";
import { BoxWhiskerTooltip } from "./tooltips/BoxWhiskerTooltip";

interface BoxWhiskerChartProps {
  data: BoxWhiskerData[];
}

export const BoxWhiskerChart = ({ data }: BoxWhiskerChartProps) => {
  const transformedData = useMemo(() => transformBoxWhiskerData(data), [data]);

  return (
    <Card className="p-4 bg-gaming-card">
      <h3 className="text-xl font-bold mb-4 text-gaming-accent">Performance Distribution</h3>
      <div className="h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer>
            <ComposedChart data={transformedData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#9F9EA1" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                interval={0}
                stroke="#9F9EA1"
              />
              <YAxis stroke="#9F9EA1" />
              <Tooltip content={BoxWhiskerTooltip} />
              
              <Bar stackId="boxplot" dataKey="min" fill="none" />
              <Bar stackId="boxplot" dataKey="bottomWhisker" fill="none" shape={<WhiskerLine />} />
              <Bar stackId="boxplot" dataKey="bottomBox" fill="#9b87f5" stroke="#E5DEFF" strokeWidth={1} />
              <Bar stackId="boxplot" dataKey="min" fill="none" shape={<MedianLine />} />
              <Bar stackId="boxplot" dataKey="topBox" fill="#9b87f5" stroke="#E5DEFF" strokeWidth={1} />
              <Bar stackId="boxplot" dataKey="topWhisker" fill="none" shape={<WhiskerLine />} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};