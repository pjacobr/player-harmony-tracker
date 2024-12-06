export const calculateKDA = (kills: number, deaths: number, assists: number): number => {
  return (kills + (assists / 3)) / Math.max(deaths, 1);
};

export const calculateWinRate = (wins: number, totalGames: number): number => {
  return (wins / totalGames) * 100;
};

export const getTooltipDescriptions = () => ({
  kda: {
    title: "KDA Calculation",
    formula: "(Kills + (Assists ÷ 3)) ÷ Deaths",
    description: "Weighted ratio that values kills more than assists. Higher is better."
  },
  performance: {
    title: "Performance Metrics",
    description: "Average kills, deaths, and assists per game, showing raw performance stats."
  },
  distribution: {
    title: "Kill Distribution",
    description: "Box plot showing: Minimum, 25th percentile, Median, 75th percentile, and Maximum kills."
  },
  teamSolo: {
    title: "Team vs Solo KDA",
    formula: "(Kills + (Assists ÷ 3)) ÷ Deaths",
    description: "Compares KDA performance in team games vs solo games."
  },
  connections: {
    title: "Player Connections",
    description: "Network showing player relationships. Line colors indicate win rate, thickness shows games played together."
  }
});