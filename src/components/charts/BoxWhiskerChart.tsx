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
import { StatTooltip } from "../analytics/StatTooltip";
import { getTooltipDescriptions } from "@/utils/kdaCalculations";

interface BoxWhiskerChartProps {
  data: BoxWhiskerData[];
}

export const BoxWhiskerChart = ({ data }: BoxWhiskerChartProps) => {
  const transformedData = useMemo(() => transformBoxWhiskerData(data), [data]);
  const tooltips = getTooltipDescriptions();

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">Performance Distribution</h3>
        <StatTooltip {...tooltips.distribution} />
      </div>
      <div className="h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer>
            <ComposedChart data={transformedData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid className="stroke-muted/20" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                interval={0}
              />
              <YAxis />
              <Tooltip content={BoxWhiskerTooltip} />
              
              <Bar stackId="boxplot" dataKey="min" fill="none" />
              <Bar stackId="boxplot" dataKey="bottomWhisker" fill="none" shape={<WhiskerLine />} />
              <Bar stackId="boxplot" dataKey="bottomBox" className="fill-primary stroke-primary/20" strokeWidth={1} />
              <Bar stackId="boxplot" dataKey="min" fill="none" shape={<MedianLine />} />
              <Bar stackId="boxplot" dataKey="topBox" className="fill-primary stroke-primary/20" strokeWidth={1} />
              <Bar stackId="boxplot" dataKey="topWhisker" fill="none" shape={<WhiskerLine />} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};