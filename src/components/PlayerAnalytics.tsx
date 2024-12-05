import { Player } from "@/types/player";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

interface PlayerAnalyticsProps {
  players: Player[];
}

interface GameStats {
  player_id: string;
  kills: number;
  deaths: number;
  assists: number;
  created_at: string;
}

export const PlayerAnalytics = ({ players }: PlayerAnalyticsProps) => {
  const { data: gameStats } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      // Get all game stats for the selected players
      const playerIds = players.map(p => p.id);
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .in('player_id', playerIds)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as GameStats[];
    },
    enabled: players.length > 0
  });

  const calculateAverages = () => {
    if (!gameStats || gameStats.length === 0) return [];

    const playerStats = players.map(player => {
      const playerGames = gameStats.filter(game => game.player_id === player.id);
      const totalGames = playerGames.length || 1;

      return {
        name: player.name,
        avgKills: Number((playerGames.reduce((sum, game) => sum + game.kills, 0) / totalGames).toFixed(2)),
        avgDeaths: Number((playerGames.reduce((sum, game) => sum + game.deaths, 0) / totalGames).toFixed(2)),
        avgAssists: Number((playerGames.reduce((sum, game) => sum + game.assists, 0) / totalGames).toFixed(2)),
        kda: Number(((playerGames.reduce((sum, game) => sum + game.kills + game.assists, 0)) / 
              Math.max(playerGames.reduce((sum, game) => sum + game.deaths, 0), 1)).toFixed(2))
      };
    });

    return playerStats;
  };

  const averageStats = calculateAverages();

  if (!gameStats || gameStats.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Player Analytics</h2>
        <Card className="p-4 bg-gaming-card">
          <p className="text-gaming-muted">No game data available for the selected players.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Player Analytics</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 bg-gaming-card">
          <h3 className="text-xl font-bold mb-4 text-gaming-accent">Average KDA Ratios</h3>
          <div className="h-[300px]">
            <ChartContainer config={{}}>
              <BarChart data={averageStats}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="kda" fill="#6D28D9" name="KDA Ratio" />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        <Card className="p-4 bg-gaming-card">
          <h3 className="text-xl font-bold mb-4 text-gaming-accent">Average Performance Metrics</h3>
          <div className="h-[300px]">
            <ChartContainer config={{}}>
              <BarChart data={averageStats}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="avgKills" fill="#4F46E5" name="Avg Kills" />
                <Bar dataKey="avgDeaths" fill="#DC2626" name="Avg Deaths" />
                <Bar dataKey="avgAssists" fill="#2563EB" name="Avg Assists" />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};