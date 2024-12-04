import { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { PlayerCard } from "@/components/PlayerCard";
import { TeamDisplay } from "@/components/TeamDisplay";
import { MatchScoreForm } from "@/components/MatchScoreForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateHandicap, balanceTeams } from "@/utils/calculations";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const [newPlayerName, setNewPlayerName] = useState("");
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
      return data.map(player => ({ ...player, isSelected: false }));
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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
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

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player name",
        variant: "destructive",
      });
      return;
    }

    addPlayerMutation.mutate(newPlayerName);
    setNewPlayerName("");
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    updatePlayerMutation.mutate(updatedPlayer);
  };

  const handleDeletePlayer = (id: string) => {
    deletePlayerMutation.mutate(id);
  };

  const handleToggleSelect = (id: string) => {
    const updatedPlayers = players.map(p => 
      p.id === id ? { ...p, isSelected: !p.isSelected } : p
    );
    queryClient.setQueryData(['players'], updatedPlayers);
  };

  const handleMatchScores = async (scores: { id: string; kills: number; deaths: number; assists: number }[]) => {
    for (const score of scores) {
      const player = players.find(p => p.id === score.id);
      if (player) {
        const newKills = player.kills + score.kills;
        const newDeaths = player.deaths + score.deaths;
        const newAssists = player.assists + score.assists;
        const newHandicap = calculateHandicap(newKills, newDeaths, newAssists);
        
        await updatePlayerMutation.mutateAsync({
          ...player,
          kills: newKills,
          deaths: newDeaths,
          assists: newAssists,
          handicap: newHandicap
        });
      }
    }
  };

  const { teamA, teamB } = balanceTeams(players);
  const selectedPlayers = players.filter(p => p.isSelected);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gaming-background text-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Player Handicap Tracker</h1>
        
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAddPlayer}>Add Player</Button>
        </div>

        {selectedPlayers.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Balanced Teams</h2>
              <TeamDisplay teamA={teamA} teamB={teamB} />
            </div>
            
            <div className="mb-8">
              <MatchScoreForm
                selectedPlayers={selectedPlayers}
                onScoreSubmit={handleMatchScores}
              />
            </div>
          </>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                onUpdate={handleUpdatePlayer}
                onDelete={handleDeletePlayer}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;