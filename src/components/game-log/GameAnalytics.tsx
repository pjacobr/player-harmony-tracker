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
          map:maps!game_scores_map_id_fkey(name)
        `);
      
      if (error) throw error;
      return data;
    },
  });

  if (!games) return null;

  // Calculate unique games per map using Sets
  const gamesPerMap = games.reduce((acc, game) => {
    const mapName = game.map?.name || "Unknown Map";
    if (!acc[mapName]) {
      acc[mapName] = new Set();
    }
    acc[mapName].add(game.game_id);
    return acc;
  }, {} as Record<string, Set<string>>);

  const mapData = Object.entries(gamesPerMap).map(([name, gameIds]) => ({
    name,
    games: gameIds.size, // Count unique games
  }));

  // Calculate games and players per day
  const gamesByDay = games.reduce((acc, game) => {
    const day = startOfDay(parseISO(game.created_at)).toISOString();
    if (!acc[day]) {
      acc[day] = {
        date: day,
        games: new Set([game.game_id]),
        players: new Set(),
      };
    } else {
      acc[day].games.add(game.game_id);
    }
    return acc;
  }, {} as Record<string, { date: string; games: Set<string>; players: Set<string> }>);

  const dailyData = Object.entries(gamesByDay).map(([date, data]) => ({
    name: format(parseISO(date), "MMM d"),
    games: data.games.size,
  }));

  return (
    <div className="space-y-8 mt-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Games per Map</h3>
        <div className="h-64 bg-gaming-card rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mapData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="games" fill="#8884d8" />
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
              <Bar dataKey="games" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}