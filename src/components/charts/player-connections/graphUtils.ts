import { FilterMetric, GraphData } from "./types";
import { Player } from "@/types/player";
import { calculateTeamPerformance } from "@/utils/playerStats";

export const createGraphData = (
  players: Player[],
  gameStats: any[],
  selectedMetric: FilterMetric,
  minValue: number
): GraphData => {
  const nodes = players.map(player => ({
    id: player.id,
    name: player.name,
  }));

  const links = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const performance = calculateTeamPerformance(
        gameStats,
        players[i].id,
        players[j].id
      );
      
      if (performance.gamesPlayed > 0) {
        const metrics = {
          winRate: performance.winRate,
          gamesPlayed: performance.gamesPlayed,
          avgKDA: performance.avgKDA
        };

        if (metrics[selectedMetric] >= minValue) {
          links.push({
            source: players[i].id,
            target: players[j].id,
            ...metrics
          });
        }
      }
    }
  }

  return { nodes, links };
};

export const getNodeColor = (node: any, links: any[]) => {
  const hasLinks = links.some(
    (link: any) => link.source.id === node.id || link.target.id === node.id
  );
  return hasLinks ? "hsl(var(--primary))" : "hsl(var(--muted))";
};

export const getLinkColor = (link: any, selectedMetric: FilterMetric, metricRanges: any) => {
  const value = link[selectedMetric];
  const { min, max } = metricRanges[selectedMetric];
  const normalizedValue = (value - min) / (max - min);
  
  if (normalizedValue >= 0.7) return "hsl(var(--accent))";
  if (normalizedValue >= 0.4) return "hsl(var(--secondary))";
  return "hsl(var(--muted))";
};
