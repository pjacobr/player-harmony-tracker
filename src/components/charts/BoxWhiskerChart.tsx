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
  const transformedData = useMemo(() => {
    // First, find the maximum score for each game mode type
    const gameMaxScores = data.reduce((maxScores, player) => {
      const playerGames = player.games || [];
      playerGames.forEach(game => {
        const gameId = game.game_id;
        const gameMode = game.game_mode || 'Slayer';
        
        if (!maxScores[gameId]) {
          maxScores[gameId] = {
            mode: gameMode,
            maxScore: 0
          };
        }

        // For team games, sum up all scores for the same team
        if (game.team_number) {
          const teamScores = playerGames
            .filter(g => g.game_id === gameId && g.team_number === game.team_number)
            .reduce((sum, g) => sum + g.kills, 0);
          maxScores[gameId].maxScore = Math.max(maxScores[gameId].maxScore, teamScores);
        } else {
          // For free-for-all, track individual highest score
          maxScores[gameId].maxScore = Math.max(maxScores[gameId].maxScore, game.kills);
        }
      });
      return maxScores;
    }, {} as Record<string, { mode: string; maxScore: number }>);

    // Now normalize the scores based on game type and max scores
    const normalizedData = data.map(player => {
      const kills = (player.games || []).map(game => {
        const maxScore = gameMaxScores[game.game_id]?.maxScore || 25; // fallback to 25
        return (game.kills / maxScore) * 100; // Convert to percentage of max possible score
      }).sort((a, b) => a - b);

      const n = kills.length;
      if (n === 0) return { ...player, min: 0, q1: 0, median: 0, q3: 0, max: 0, average: 0 };
      
      return {
        name: player.name,
        min: kills[0],
        q1: kills[Math.floor(n * 0.25)],
        median: kills[Math.floor(n * 0.5)],
        q3: kills[Math.floor(n * 0.75)],
        max: kills[n - 1],
        average: kills.reduce((a, b) => a + b, 0) / n,
        kdSpread: 0 // Added to satisfy type requirements, not used for sorting
      };
    });

    return transformBoxWhiskerData(normalizedData);
  }, [data]);

  const tooltips = getTooltipDescriptions();

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">Performance Distribution (%)</h3>
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
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={BoxWhiskerTooltip} />
              
              <Bar stackId="boxplot" dataKey="min" fill="none" />
              <Bar stackId="boxplot" dataKey="bottomWhisker" fill="none" shape={<WhiskerLine color="hsl(var(--primary))" />} />
              <Bar stackId="boxplot" dataKey="bottomBox" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth={1} />
              <Bar stackId="boxplot" dataKey="min" fill="none" shape={<MedianLine color="hsl(var(--primary))" />} />
              <Bar stackId="boxplot" dataKey="topBox" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth={1} />
              <Bar stackId="boxplot" dataKey="topWhisker" fill="none" shape={<WhiskerLine color="hsl(var(--primary))" />} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};