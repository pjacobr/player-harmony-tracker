import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
          map:maps!game_scores_map_id_fkey(name)
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
    
    // Determine if it's a team game based on team_number presence
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

  const dailyData = Object.entries(gamesByDay).map(([date, data]) => ({
    name: format(parseISO(date), "MMM d"),
    teamGames: data.team.size,
    individualGames: data.individual.size,
  }));

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Games per Map</h3>
          <div className="h-64 bg-gaming-card rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mapData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="teamGames" name="Team Games" fill="#8884d8" stackId="a" />
                <Bar dataKey="individualGames" name="Individual Games" fill="#82ca9d" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Games per Day</h3>
          <div className="h-64 bg-gaming-card rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="teamGames" name="Team Games" fill="#8884d8" stackId="a" />
                <Bar dataKey="individualGames" name="Individual Games" fill="#82ca9d" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}