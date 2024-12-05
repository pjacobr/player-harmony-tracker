import { useMemo } from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { Player } from "@/types/player";
import { ForceGraph2D } from "react-force-graph";
import { calculateTeamPerformance } from "@/utils/playerStats";

interface PlayerConnectionsChartProps {
  players: Player[];
  gameStats: any[];
}

export const PlayerConnectionsChart = ({ players, gameStats }: PlayerConnectionsChartProps) => {
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
    <div className="bg-gaming-card rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4">Player Connections</h3>
      <div className="h-[500px] w-full">
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
          width={800}
          height={500}
          d3VelocityDecay={0.3}
          d3AlphaDecay={0.02}
          cooldownTicks={100}
        />
      </div>
    </div>
  );
};