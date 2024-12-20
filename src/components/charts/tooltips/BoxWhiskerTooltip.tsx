import { BoxWhiskerData } from "../types/chartTypes";

interface BoxWhiskerTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      originalData: BoxWhiskerData;
      name: string;
    };
  }>;
}

export const BoxWhiskerTooltip = ({ active, payload }: BoxWhiskerTooltipProps) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload.originalData;
  const name = payload[0].payload.name;

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <h3 className="font-bold mb-2">{name}</h3>
      <div className="space-y-1 text-sm">
        <p>Games Played: {data.totalGames}</p>
        <p>Highest Kills: {data.max}</p>
        <p>Upper Quartile: {data.q3?.toFixed(1)}</p>
        <p>Median: {data.median?.toFixed(1)}</p>
        <p>Lower Quartile: {data.q1?.toFixed(1)}</p>
        <p>Lowest Kills: {data.min}</p>
        <p className="mt-2 pt-2 border-t border-border">
          Average: {data.average?.toFixed(1)}
        </p>
      </div>
    </div>
  );
};