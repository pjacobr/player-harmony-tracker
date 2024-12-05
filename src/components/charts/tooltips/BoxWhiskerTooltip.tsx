import { BoxWhiskerData } from "../types/chartTypes";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
}

export const BoxWhiskerTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload.originalData as BoxWhiskerData;
  
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
};