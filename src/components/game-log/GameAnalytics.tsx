import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfDay } from "date-fns";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function GameAnalytics() {
  const { data: games } = useQuery({
    queryKey: ["game-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_scores")
        .select(`
          game_id,
          created_at,
          team_number,
          map:maps!game_scores_map_id_fkey(name),
          player:players!game_scores_player_id_fkey(name),
          kills,
          deaths,
          assists,
          won
        `);
      
      if (error) throw error;
      return data;
    },
  });

  if (!games) return null;

  // Calculate unique games per map using Sets, separated by game type
  const gamesPerMap = games.reduce((acc, game) => {
    const mapName = game.map?.name || "Unknown Map";
    if (!acc[mapName]) {
      acc[mapName] = {
        team: new Set(),
        individual: new Set(),
      };
    }
    
    const gameType = game.team_number !== null ? 'team' : 'individual';
    acc[mapName][gameType].add(game.game_id);
    
    return acc;
  }, {} as Record<string, { team: Set<string>; individual: Set<string> }>);

  const mapData = Object.entries(gamesPerMap).map(([name, games]) => ({
    name,
    teamGames: games.team.size,
    individualGames: games.individual.size,
  }));

  // Calculate games per day, separated by type
  const gamesByDay = games.reduce((acc, game) => {
    const day = startOfDay(parseISO(game.created_at)).toISOString();
    if (!acc[day]) {
      acc[day] = {
        date: day,
        team: new Set(),
        individual: new Set(),
      };
    }
    
    const gameType = game.team_number !== null ? 'team' : 'individual';
    acc[day][gameType].add(game.game_id);
    
    return acc;
  }, {} as Record<string, { date: string; team: Set<string>; individual: Set<string> }>);

  const dailyData = Object.entries(gamesByDay)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, data]) => ({
      name: format(parseISO(date), "MMM d"),
      teamGames: data.team.size,
      individualGames: data.individual.size,
    }));

  // Calculate player statistics
  const playerStats = games.reduce((acc, game) => {
    const playerName = game.player?.name || "Unknown Player";
    if (!acc[playerName]) {
      acc[playerName] = {
        name: playerName,
        totalGames: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
    }
    
    acc[playerName].totalGames++;
    if (game.won) acc[playerName].wins++;
    acc[playerName].kills += game.kills;
    acc[playerName].deaths += game.deaths;
    acc[playerName].assists += game.assists;
    
    return acc;
  }, {} as Record<string, {
    name: string;
    totalGames: number;
    wins: number;
    kills: number;
    deaths: number;
    assists: number;
  }>);

  const playerStatsArray = Object.values(playerStats)
    .map(stats => ({
      ...stats,
      winRate: ((stats.wins / stats.totalGames) * 100).toFixed(1),
      kda: ((stats.kills + stats.assists) / Math.max(stats.deaths, 1)).toFixed(2),
      avgKills: (stats.kills / stats.totalGames).toFixed(1),
      avgDeaths: (stats.deaths / stats.totalGames).toFixed(1),
      avgAssists: (stats.assists / stats.totalGames).toFixed(1),
    }))
    .sort((a, b) => Number(b.kda) - Number(a.kda));

  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Games per Map</h3>
          <div className="h-64 bg-gaming-card rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mapData}>
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="individualGames" name="Individual Games" stackId="a" fill="#82ca9d" />
                <Bar dataKey="teamGames" name="Team Games" stackId="a" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Games per Day</h3>
          <div className="h-64 bg-gaming-card rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone"
                  dataKey="teamGames" 
                  name="Team Games" 
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone"
                  dataKey="individualGames" 
                  name="Individual Games" 
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}