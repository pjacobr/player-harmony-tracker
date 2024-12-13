import { BoxWhiskerData } from "../types/chartTypes";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
}

export const BoxWhiskerTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload.originalData as BoxWhiskerData;
  
  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <p className="font-semibold">{data.name}</p>
      <p>Maximum: {data.max}</p>
      <p>Upper Quartile: {data.q3}</p>
      <p>Median: {data.median}</p>
      <p>Lower Quartile: {data.q1}</p>
      <p>Minimum: {data.min}</p>
    </div>
  );
};