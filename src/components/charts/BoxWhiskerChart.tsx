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
  ResponsiveContainer,
  ReferenceLine,
  Label
} from "recharts";
import { BoxWhiskerData } from "./types/chartTypes";
import { transformBoxWhiskerData } from "./utils/dataTransforms";
import { MedianLine } from "./shapes/MedianLine";
import { WhiskerLine } from "./shapes/WhiskerLine";
import { BoxWhiskerTooltip } from "./tooltips/BoxWhiskerTooltip";
import { StatTooltip } from "../analytics/StatTooltip";

interface BoxWhiskerChartProps {
  data: BoxWhiskerData[];
}

export const BoxWhiskerChart = ({ data }: BoxWhiskerChartProps) => {
  const transformedData = useMemo(() => {
    const processedData = data.map(player => {
      const playerGames = player.games || [];
      if (playerGames.length === 0) {
        return {
          name: player.name,
          min: 0,
          q1: 0,
          median: 0,
          q3: 0,
          max: 0,
          average: 0,
          totalGames: 0,
          kdSpread: 0
        };
      }

      const kills = playerGames.map(game => game.kills).sort((a, b) => a - b);
      const n = kills.length;
      
      return {
        name: player.name,
        min: kills[0],
        q1: kills[Math.floor(n * 0.25)],
        median: kills[Math.floor(n * 0.5)],
        q3: kills[Math.floor(n * 0.75)],
        max: kills[n - 1],
        average: kills.reduce((a, b) => a + b, 0) / n,
        totalGames: n,
        kdSpread: 0
      };
    });

    return transformBoxWhiskerData(processedData);
  }, [data]);

  if (!data.length) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold">Performance Distribution</h3>
          <StatTooltip 
            title="Performance Distribution"
            description="Shows the distribution of kills across all games for each player. The box shows the middle 50% of scores, the line in the middle is the median, and the whiskers show the full range."
          />
        </div>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No game data available
        </div>
      </Card>
    );
  }

  const maxKills = Math.max(...transformedData.map(d => d.originalData.max || 0));
  const avgLine = transformedData.reduce((sum, d) => sum + (d.originalData.average || 0), 0) / transformedData.length;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">Performance Distribution</h3>
        <StatTooltip 
          title="Performance Distribution"
          description="Shows the distribution of kills across all games for each player. The box shows the middle 50% of scores, the line in the middle is the median, and the whiskers show the full range. The dashed line shows the average across all players."
        />
      </div>
      <div className="h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer>
            <ComposedChart 
              data={transformedData} 
              margin={{ top: 20, right: 30, bottom: 60, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                interval={0}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                domain={[0, maxKills + 2]}
                tick={{ fill: 'hsl(var(--foreground))' }}
                label={{ 
                  value: 'Kills per Game', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'hsl(var(--foreground))'
                }}
              />
              <Tooltip content={BoxWhiskerTooltip} />
              
              <ReferenceLine 
                y={avgLine} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="3 3"
              >
                <Label 
                  value={`Avg: ${avgLine.toFixed(1)}`} 
                  position="right"
                  fill="hsl(var(--primary))"
                />
              </ReferenceLine>

              <Bar 
                stackId="boxplot" 
                dataKey="min" 
                fill="none" 
              />
              <Bar 
                stackId="boxplot" 
                dataKey="bottomWhisker" 
                fill="none" 
                shape={<WhiskerLine color="hsl(var(--primary))" />} 
              />
              <Bar 
                stackId="boxplot" 
                dataKey="bottomBox" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.3}
                stroke="hsl(var(--primary))" 
                strokeWidth={1} 
              />
              <Bar 
                stackId="boxplot" 
                dataKey="min" 
                fill="none" 
                shape={<MedianLine color="hsl(var(--primary))" />} 
              />
              <Bar 
                stackId="boxplot" 
                dataKey="topBox" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.3}
                stroke="hsl(var(--primary))" 
                strokeWidth={1} 
              />
              <Bar 
                stackId="boxplot" 
                dataKey="topWhisker" 
                fill="none" 
                shape={<WhiskerLine color="hsl(var(--primary))" />} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};