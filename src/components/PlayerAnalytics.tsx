import { Player } from "@/types/player";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KDAChart } from "./charts/KDAChart";
import { PerformanceChart } from "./charts/PerformanceChart";
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Player Analytics</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <KDAChart data={averageStats} />
        <PerformanceChart data={averageStats} />
      </div>
    </div>
  );
};