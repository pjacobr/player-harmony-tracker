import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Player } from "@/types/player";
import { TeamDisplay } from "@/components/TeamDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { balanceTeams } from "@/utils/calculations";
import { PlayerList } from "@/components/PlayerList";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players with their latest stats from game_scores
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      // First get all players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (playersError) throw playersError;

      // For each player, get their stats from game_scores
      const playersWithStats = await Promise.all(playersData.map(async (player) => {
        const { data: handicap } = await supabase
          .rpc('calculate_player_handicap', { player_uuid: player.id });

        const { data: latestStats } = await supabase
          .from('game_scores')
          .select('kills, deaths, assists')
          .eq('player_id', player.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...player,
          kills: latestStats?.kills || 0,
          deaths: latestStats?.deaths || 0,
          assists: latestStats?.assists || 0,
          handicap: handicap || 5,
          isSelected: true
        };
      }));

      return playersWithStats;
    }
  });

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('players')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Success",
        description: "Player added successfully",
      });
    }
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Success",
        description: "Player deleted successfully",
      });
    }
  });

  const handleToggleSelect = (id: string) => {
    const updatedPlayers = players.map(p => 
      p.id === id ? { ...p, isSelected: !p.isSelected } : p
    );
    queryClient.setQueryData(['players'], updatedPlayers);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const { teamA, teamB } = balanceTeams(players);
  const selectedPlayers = players.filter(p => p.isSelected);

  return (
    <div className="min-h-screen bg-gaming-background text-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Player Handicap Tracker</h1>
        
        <AddPlayerForm onAddPlayer={(name) => addPlayerMutation.mutate(name)} />

        {selectedPlayers.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Balanced Teams</h2>
              <TeamDisplay teamA={teamA} teamB={teamB} />
            </div>
            
            <div className="mb-8">
              <ScreenshotUpload
                onScoresDetected={(scores) => {
                  // Scores will be automatically saved to game_scores table
                  // and handicaps will be updated via database trigger
                  console.log('Scores detected:', scores);
                }}
                players={selectedPlayers}
              />
            </div>
          </>
        )}

        <PlayerList
          players={players}
          onUpdatePlayer={() => {
            // This is now handled by the screenshot upload
            queryClient.invalidateQueries({ queryKey: ['players'] });
          }}
          onDeletePlayer={(id) => deletePlayerMutation.mutate(id)}
          onToggleSelect={handleToggleSelect}
        />
      </div>
    </div>
  );
};

export default Index;