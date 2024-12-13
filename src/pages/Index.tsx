import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Player } from "@/types/player";
import { TeamDisplay } from "@/components/TeamDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { balanceTeams } from "@/utils/calculations";
import { PlayerList } from "@/components/PlayerList";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { PlayerAnalytics } from "@/components/PlayerAnalytics";
import { GameLog } from "@/components/GameLog";
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabNavigation } from "@/components/navigation/TabNavigation";

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shuffleKey, setShuffleKey] = useState(0);
  const [activeTab, setActiveTab] = useState("players");

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (playersError) throw playersError;

      const playersWithStats = await Promise.all(playersData.map(async (player) => {
        const { data: handicapResult } = await supabase
          .rpc('calculate_player_handicap', { player_uuid: player.id });

        const { data: allStats } = await supabase
          .from('game_scores')
          .select('kills, deaths, assists')
          .eq('player_id', player.id);

        const totals = allStats?.reduce((acc, game) => ({
          kills: acc.kills + game.kills,
          deaths: acc.deaths + game.deaths,
          assists: acc.assists + game.assists
        }), { kills: 0, deaths: 0, assists: 0 }) || { kills: 0, deaths: 0, assists: 0 };

        return {
          ...player,
          ...totals,
          handicap: handicapResult || 5,
          isSelected: true
        };
      }));

      return playersWithStats;
    }
  });

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

  const { teamA, teamB } = balanceTeams(players, shuffleKey);
  const selectedPlayers = players.filter(p => p.isSelected);

  const handleShuffle = () => {
    setShuffleKey(prev => prev + 1);
    toast({
      title: "Teams Shuffled",
      description: "New balanced teams have been generated",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">
          Player Handicap Tracker
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-4">
            <TabsContent value="players" className="mt-0">
              <AddPlayerForm onAddPlayer={(name) => addPlayerMutation.mutate(name)} />
              <PlayerList
                players={players}
                onUpdatePlayer={() => {
                  queryClient.invalidateQueries({ queryKey: ["players"] });
                }}
                onDeletePlayer={(id) => deletePlayerMutation.mutate(id)}
                onToggleSelect={handleToggleSelect}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              {selectedPlayers.length > 0 ? (
                <PlayerAnalytics players={selectedPlayers} />
              ) : (
                <div className="text-center text-gaming-muted">
                  Please select players to view analytics
                </div>
              )}
            </TabsContent>

            <TabsContent value="teams" className="mt-0">
              {selectedPlayers.length > 0 ? (
                <TeamDisplay
                  teamA={teamA}
                  teamB={teamB}
                  onShuffle={handleShuffle}
                />
              ) : (
                <div className="text-center text-gaming-muted">
                  Please select players to create teams
                </div>
              )}
            </TabsContent>

            <TabsContent value="screenshots" className="mt-0">
              {selectedPlayers.length > 0 ? (
                <ScreenshotUpload
                  onScoresDetected={(scores) => {
                    console.log("Scores detected:", scores);
                    queryClient.invalidateQueries({ queryKey: ["players"] });
                  }}
                  players={selectedPlayers}
                />
              ) : (
                <div className="text-center text-gaming-muted">
                  Please select players to upload screenshots
                </div>
              )}
            </TabsContent>

            <TabsContent value="game-logs" className="mt-0">
              <GameLog />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;