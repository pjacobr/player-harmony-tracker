import { Player } from "@/types/player";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KDAChart } from "./charts/KDAChart";
import { PerformanceChart } from "./charts/PerformanceChart";
import { BoxWhiskerChart } from "./charts/BoxWhiskerChart";
import { TeamVsSoloChart } from "./charts/TeamVsSoloChart";
import { calculatePlayerAverages } from "@/utils/playerStats";

interface PlayerAnalyticsProps {
  players: Player[];
}

export const PlayerAnalytics = ({ players }: PlayerAnalyticsProps) => {
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

  const averageStats = calculatePlayerAverages(gameStats, players);

  // Calculate box plot data
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
        max: kills[n - 1]
      };
    });
  };

  // Calculate team vs solo performance
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
        return (totalKills + totalAssists) / Math.max(totalDeaths, 1);
      };

      return {
        name: player.name,
        soloKDA: Number(calculateKDA(soloGames).toFixed(2)),
        teamKDA: Number(calculateKDA(teamGames).toFixed(2))
      };
    });
  };

  const boxPlotData = calculateBoxPlotData();
  const teamVsSoloData = calculateTeamVsSoloPerformance();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Player Analytics</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <KDAChart data={averageStats} />
        <PerformanceChart data={averageStats} />
        <BoxWhiskerChart data={boxPlotData} />
        <TeamVsSoloChart data={teamVsSoloData} />
      </div>
    </div>
  );
};