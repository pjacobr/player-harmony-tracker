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

  // Fetch players
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data.map(player => ({ ...player, isSelected: true }));
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

  // Update player mutation
  const updatePlayerMutation = useMutation({
    mutationFn: async (player: Player) => {
      const { data, error } = await supabase
        .from('players')
        .update({
          name: player.name,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          handicap: player.handicap
        })
        .eq('id', player.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Success",
        description: "Player updated successfully",
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
          onUpdatePlayer={(player) => updatePlayerMutation.mutate(player)}
          onDeletePlayer={(id) => deletePlayerMutation.mutate(id)}
          onToggleSelect={handleToggleSelect}
        />
      </div>
    </div>
  );
};

export default Index;