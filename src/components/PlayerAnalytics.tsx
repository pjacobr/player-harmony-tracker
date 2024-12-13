import { Player } from "@/types/player";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KDAChart } from "./charts/KDAChart";
import { PerformanceChart } from "./charts/PerformanceChart";
import { BoxWhiskerChart } from "./charts/BoxWhiskerChart";
import { TeamVsSoloChart } from "./charts/TeamVsSoloChart";
import { PlayerConnectionsChart } from "./charts/PlayerConnectionsChart";
import { calculatePlayerAverages } from "@/utils/playerStats";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateKDA, calculateWinRate } from "@/utils/kdaCalculations";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { useState } from "react";

interface PlayerAnalyticsProps {
  players: Player[];
}

export const PlayerAnalytics = ({ players }: PlayerAnalyticsProps) => {
  const [sortAscending, setSortAscending] = useState(false);

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

  const sortedStats = [...averageStats].sort((a, b) => 
    sortAscending ? a.kdSpread - b.kdSpread : b.kdSpread - a.kdSpread
  );

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
  }).sort((a, b) => sortAscending ? 
    Number(a.kda) - Number(b.kda) : 
    Number(b.kda) - Number(a.kda)
  );

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
    }).sort((a, b) => sortAscending ? 
      a.average - b.average : 
      b.average - a.average
    );
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
        totalKDA: soloKDA + teamKDA
      };
    }).sort((a, b) => sortAscending ? 
      a.totalKDA - b.totalKDA : 
      b.totalKDA - a.totalKDA
    );
  };

  const boxPlotData = calculateBoxPlotData();
  const teamVsSoloData = calculateTeamVsSoloPerformance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Player Analytics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAscending(!sortAscending)}
          className="gap-2"
        >
          {sortAscending ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
          Sort {sortAscending ? 'Ascending' : 'Descending'}
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <KDAChart data={sortedStats} />
        <PerformanceChart data={sortedStats} />
        <BoxWhiskerChart data={boxPlotData} />
        <TeamVsSoloChart data={teamVsSoloData} />
      </div>
      <PlayerConnectionsChart players={players} gameStats={gameStats} />
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Player Statistics Summary</h3>
        <div className="bg-gaming-card rounded-lg p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Games</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">KDA</TableHead>
                <TableHead className="text-right">Avg Kills</TableHead>
                <TableHead className="text-right">Avg Deaths</TableHead>
                <TableHead className="text-right">Avg Assists</TableHead>
                <TableHead className="text-right">K/D Spread</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerStats.map((stats) => (
                <TableRow key={stats.name}>
                  <TableCell className="font-medium">{stats.name}</TableCell>
                  <TableCell className="text-right">{stats.totalGames}</TableCell>
                  <TableCell className="text-right">{stats.winRate}%</TableCell>
                  <TableCell className="text-right">{stats.kda}</TableCell>
                  <TableCell className="text-right">{stats.avgKills}</TableCell>
                  <TableCell className="text-right">{stats.avgDeaths}</TableCell>
                  <TableCell className="text-right">{stats.avgAssists}</TableCell>
                  <TableCell className="text-right">{stats.kdSpread}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};