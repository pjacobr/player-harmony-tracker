import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GameHeader } from "./GameHeader";
import { GameScoreCard } from "./GameScoreCard";
import { calculateWinner } from "@/utils/gameWinnerUtils";
import { GameScore } from "@/types/gameScore";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface GameItemProps {
  game: {
    id: string;
    created_at: string;
    game_mode: string;
    map: {
      name: string;
    } | null;
    screenshot_url: string | null;
    scores: GameScore[];
  };
}

export function GameItem({ game }: GameItemProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const { winners, winningTeam } = calculateWinner(game.scores, game.game_mode);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all players
  const { data: players } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Filter out players that are already in the game
  const availablePlayers = players?.filter(
    (player) => !game.scores.some((score) => score.player_id === player.id)
  );

  const addPlayerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerId) return;

      const { data, error } = await supabase
        .from("game_scores")
        .insert({
          game_id: game.id,
          player_id: selectedPlayerId,
          kills: 0,
          deaths: 0,
          assists: 0,
          game_mode: game.game_mode,
          map_id: game.map?.name ? (await getMapId(game.map.name)) : null,
          screenshot_url: game.screenshot_url,
        })
        .select(`
          id,
          game_id,
          player_id,
          kills,
          deaths,
          assists,
          won,
          created_at,
          game_mode,
          team_number,
          screenshot_url,
          map:maps!game_scores_map_id_fkey(name),
          player:players!fk_player(name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-logs"] });
      setSelectedPlayerId("");
      toast({
        title: "Success",
        description: "Player added to game successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add player: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to get map_id from name
  async function getMapId(mapName: string) {
    const { data, error } = await supabase
      .from("maps")
      .select("id")
      .eq("name", mapName)
      .single();
    
    if (error) throw error;
    return data.id;
  }

  return (
    <AccordionItem value={game.id}>
      <AccordionTrigger className="hover:no-underline">
        <GameHeader
          gameMode={game.game_mode}
          mapName={game.map?.name}
          createdAt={game.created_at}
          winners={winners}
          winningTeam={winningTeam}
        />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {game.screenshot_url && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="rounded-lg overflow-hidden max-w-2xl mx-auto cursor-pointer transition-transform hover:scale-[1.02]">
                  <img
                    src={game.screenshot_url}
                    alt="Game Screenshot"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] w-fit p-0 bg-transparent border-0">
                <img
                  src={game.screenshot_url}
                  alt="Game Screenshot"
                  className="w-auto max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                />
              </DialogContent>
            </Dialog>
          )}
          <div className="space-y-2">
            {game.scores
              .sort((a, b) => b.kills - a.kills)
              .map((score) => (
                <GameScoreCard 
                  key={score.player_id} 
                  score={{
                    ...score,
                    id: score.id || score.player_id
                  }} 
                />
              ))}

            {availablePlayers && availablePlayers.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-2 rounded bg-secondary/20">
                <Select
                  value={selectedPlayerId}
                  onValueChange={setSelectedPlayerId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select player to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addPlayerMutation.mutate()}
                  disabled={!selectedPlayerId || addPlayerMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Player
                </Button>
              </div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}