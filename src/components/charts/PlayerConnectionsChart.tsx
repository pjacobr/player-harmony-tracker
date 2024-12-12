import { useMemo } from "react";
import { Player } from "@/types/player";
import { ForceGraph2D } from "react-force-graph";
import { calculateTeamPerformance } from "@/utils/playerStats";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useWindowSize } from "@/hooks/use-window-size";

interface PlayerConnectionsChartProps {
  players: Player[];
  gameStats: any[];
}

export const PlayerConnectionsChart = ({ players, gameStats }: PlayerConnectionsChartProps) => {
  const { width } = useWindowSize();
  const graphWidth = Math.min(width - 32, 800); // 32px for padding
  const graphHeight = Math.min(500, graphWidth * 0.75); // Maintain aspect ratio

  const graphData = useMemo(() => {
    const nodes = players.map(player => ({
      id: player.id,
      name: player.name,
    }));

    const links = [];
    // Create connections between all players
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const performance = calculateTeamPerformance(
          gameStats,
          players[i].id,
          players[j].id
        );
        
        if (performance.gamesPlayed > 0) {
          links.push({
            source: players[i].id,
            target: players[j].id,
            value: performance.winRate,
            gamesPlayed: performance.gamesPlayed,
            avgKDA: performance.avgKDA
          });
        }
      }
    }

    return { nodes, links };
  }, [players, gameStats]);

  return (
    <div className="bg-gaming-card rounded-lg p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">Player Connections</h3>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gaming-muted" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Network graph showing team relationships:<br />
                - Lines: Games played together<br />
                - Line thickness: Number of games<br />
                - Line color: Win rate (Red: Low, Yellow: Medium, Green: High)<br />
                Hover over connections to see detailed stats.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="w-full" style={{ height: graphHeight }}>
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeColor={() => "#6D28D9"} // gaming.accent
          linkColor={(link: any) => {
            const value = link.value as number;
            // Color scale based on win rate
            if (value >= 0.7) return "#22C55E"; // High performance - green
            if (value >= 0.5) return "#EAB308"; // Medium performance - yellow
            return "#EF4444"; // Low performance - red
          }}
          linkWidth={(link: any) => (link.gamesPlayed as number) / 2}
          nodeRelSize={8}
          linkLabel={(link: any) => {
            const l = link as { gamesPlayed: number; value: number; avgKDA: number };
            return `Games: ${l.gamesPlayed} | Win Rate: ${(l.value * 100).toFixed(1)}% | Avg KDA: ${l.avgKDA.toFixed(2)}`;
          }}
          backgroundColor="#1F2937" // gaming.card
          width={graphWidth}
          height={graphHeight}
          d3VelocityDecay={0.3}
          d3AlphaDecay={0.02}
          cooldownTicks={100}
        />
      </div>
    </div>
  );
};