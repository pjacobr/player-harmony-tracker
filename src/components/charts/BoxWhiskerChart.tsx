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
  RectangleProps,
  ResponsiveContainer
} from "recharts";

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

// Custom shape for median lines
const MedianLine = (props: RectangleProps) => {
  const { x, y, width } = props;
  if (x == null || y == null || width == null) return null;
  
  return (
    <line 
      x1={x} 
      y1={y} 
      x2={x + width} 
      y2={y} 
      stroke="#E5DEFF" 
      strokeWidth={2}
    />
  );
};

// Custom shape for whisker lines
const WhiskerLine = (props: RectangleProps) => {
  const { x, y, width, height } = props;
  if (x == null || y == null || width == null || height == null) return null;

  return (
    <line
      x1={x + width / 2}
      y1={y + height}
      x2={x + width / 2}
      y2={y}
      stroke="#E5DEFF"
      strokeWidth={1}
      strokeDasharray="4"
    />
  );
};

export const BoxWhiskerChart = ({ data }: BoxWhiskerChartProps) => {
  // Transform data for the stacked bar visualization
  const transformedData = useMemo(() => 
    data.map((item) => ({
      name: item.name,
      min: item.min,
      bottomWhisker: item.q1 - item.min,
      bottomBox: item.median - item.q1,
      topBox: item.q3 - item.median,
      topWhisker: item.max - item.q3,
      // Store original values for tooltip
      originalData: item
    })), [data]
  );

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
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload.originalData;
                  return (
                    <div className="bg-gaming-card p-2 rounded border border-gaming-accent">
                      <p className="font-semibold text-gaming-accent">{data.name}</p>
                      <p className="text-gray-300">Maximum: {data.max}</p>
                      <p className="text-gray-300">Upper Quartile: {data.q3}</p>
                      <p className="text-gray-300">Median: {data.median}</p>
                      <p className="text-gray-300">Lower Quartile: {data.q1}</p>
                      <p className="text-gray-300">Minimum: {data.min}</p>
                    </div>
                  );
                }}
              />
              
              {/* Base position */}
              <Bar stackId="boxplot" dataKey="min" fill="none" />
              
              {/* Bottom whisker */}
              <Bar 
                stackId="boxplot" 
                dataKey="bottomWhisker" 
                fill="none" 
                shape={<WhiskerLine />} 
              />
              
              {/* Bottom box */}
              <Bar 
                stackId="boxplot" 
                dataKey="bottomBox" 
                fill="#9b87f5" 
                stroke="#E5DEFF"
                strokeWidth={1}
              />
              
              {/* Median line */}
              <Bar 
                stackId="boxplot" 
                dataKey="min" 
                fill="none" 
                shape={<MedianLine />} 
              />
              
              {/* Top box */}
              <Bar 
                stackId="boxplot" 
                dataKey="topBox" 
                fill="#9b87f5" 
                stroke="#E5DEFF"
                strokeWidth={1}
              />
              
              {/* Top whisker */}
              <Bar 
                stackId="boxplot" 
                dataKey="topWhisker" 
                fill="none" 
                shape={<WhiskerLine />} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};