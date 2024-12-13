import { Player } from "@/types/player";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KDAChart } from "./charts/KDAChart";
import { PerformanceChart } from "./charts/PerformanceChart";
import { BoxWhiskerChart } from "./charts/BoxWhiskerChart";
import { TeamVsSoloChart } from "./charts/TeamVsSoloChart";
import { PlayerConnectionsChart } from "./charts/PlayerConnectionsChart";
import { calculateKDA, calculateWinRate } from "@/utils/kdaCalculations";
import { useState } from "react";
import { PlayerStatsTable } from "./analytics/PlayerStatsTable";
import { sortData, SortOption } from "@/utils/sortingUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlayerAnalyticsProps {
  players: Player[];
}

export const PlayerAnalytics = ({ players }: PlayerAnalyticsProps) => {
  const [sortOption, setSortOption] = useState<SortOption>('nameAsc');

  const { data: gameStats } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const playerIds = players.map(p => p.id);
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .in('player_id', playerIds)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: players.length > 0
  });

  if (!gameStats || gameStats.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Player Analytics</h2>
        <div className="p-4 bg-gaming-card">
          <p className="text-gaming-muted">No game data available for the selected players.</p>
        </div>
      </div>
    );
  }

  const averageStats = players.map(player => {
    const playerGames = gameStats.filter(game => game.player_id === player.id);
    const totalGames = playerGames.length || 1;
    const kills = playerGames.reduce((sum, game) => sum + game.kills, 0);
    const deaths = playerGames.reduce((sum, game) => sum + game.deaths, 0);
    const assists = playerGames.reduce((sum, game) => sum + game.assists, 0);
    const avgKills = kills / totalGames;
    const avgDeaths = deaths / totalGames;

    return {
      name: player.name,
      avgKills,
      avgDeaths,
      avgAssists: assists / totalGames,
      kdSpread: avgKills - avgDeaths
    };
  });

  const playerStats = players.map(player => {
    const playerGames = gameStats.filter(game => game.player_id === player.id);
    const totalGames = playerGames.length;
    const wins = playerGames.filter(game => game.won).length;
    const kills = playerGames.reduce((sum, game) => sum + game.kills, 0);
    const deaths = playerGames.reduce((sum, game) => sum + game.deaths, 0);
    const assists = playerGames.reduce((sum, game) => sum + game.assists, 0);
    const avgKills = kills / totalGames;
    const avgDeaths = deaths / totalGames;

    return {
      name: player.name,
      totalGames,
      winRate: calculateWinRate(wins, totalGames).toFixed(1),
      kda: calculateKDA(kills, deaths, assists).toFixed(2),
      avgKills: avgKills.toFixed(1),
      avgDeaths: avgDeaths.toFixed(1),
      avgAssists: (assists / totalGames).toFixed(1),
      kdSpread: (avgKills - avgDeaths).toFixed(1),
    };
  });

  const calculateBoxPlotData = () => {
    return players.map(player => {
      const playerGames = gameStats.filter(game => game.player_id === player.id);
      const kills = playerGames.map(game => game.kills).sort((a, b) => a - b);
      const n = kills.length;
      
      return {
        name: player.name,
        min: kills[0],
        q1: kills[Math.floor(n * 0.25)],
        median: kills[Math.floor(n * 0.5)],
        q3: kills[Math.floor(n * 0.75)],
        max: kills[n - 1],
        average: kills.reduce((a, b) => a + b, 0) / n
      };
    });
  };

  const calculateTeamVsSoloPerformance = () => {
    return players.map(player => {
      const playerGames = gameStats.filter(game => game.player_id === player.id);
      
      const soloGames = playerGames.filter(game => !game.team_number);
      const teamGames = playerGames.filter(game => game.team_number);
      
      const calculateKDA = (games: typeof playerGames) => {
        if (games.length === 0) return 0;
        const totalKills = games.reduce((sum, game) => sum + game.kills, 0);
        const totalDeaths = games.reduce((sum, game) => sum + game.deaths, 0);
        const totalAssists = games.reduce((sum, game) => sum + game.assists, 0);
        return (totalKills + (totalAssists / 3)) / Math.max(totalDeaths, 1);
      };

      const soloKDA = Number(calculateKDA(soloGames).toFixed(2));
      const teamKDA = Number(calculateKDA(teamGames).toFixed(2));

      return {
        name: player.name,
        soloKDA,
        teamKDA,
        totalKDA: soloKDA + teamKDA,
        kdSpread: soloKDA - teamKDA
      };
    });
  };

  const boxPlotData = calculateBoxPlotData();
  const teamVsSoloData = calculateTeamVsSoloPerformance();

  const sortedAverageStats = sortData(averageStats, sortOption);
  const sortedTeamVsSoloData = sortData(teamVsSoloData, sortOption);
  const sortedBoxPlotData = sortData(boxPlotData, sortOption);
  const sortedPlayerStats = sortData(playerStats, sortOption);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Player Analytics</h2>
        <Select
          value={sortOption}
          onValueChange={(value: SortOption) => setSortOption(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nameAsc">Name (A to Z)</SelectItem>
            <SelectItem value="scoreAsc">Score (Low to High)</SelectItem>
            <SelectItem value="scoreDesc">Score (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <KDAChart data={sortedAverageStats} sortOption={sortOption} />
        <PerformanceChart data={sortedAverageStats} />
        <BoxWhiskerChart data={sortedBoxPlotData} />
        <TeamVsSoloChart data={sortedTeamVsSoloData} sortOption={sortOption} />
      </div>
      <PlayerConnectionsChart players={players} gameStats={gameStats} />
      <PlayerStatsTable playerStats={sortedPlayerStats} sortOption={sortOption} />
    </div>
  );
};