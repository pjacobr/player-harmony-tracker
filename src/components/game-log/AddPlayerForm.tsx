import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddPlayerFormProps {
  gameId: string;
  gameMode: string;
  mapName: string | undefined;
  screenshotUrl: string | null;
  existingPlayerIds: string[];
}

export function AddPlayerForm({ gameId, gameMode, mapName, screenshotUrl, existingPlayerIds }: AddPlayerFormProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const availablePlayers = players?.filter(
    (player) => !existingPlayerIds.includes(player.id)
  );

  const addPlayerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerId) return;

      const { data: mapData } = await supabase
        .from("maps")
        .select("id")
        .eq("name", mapName)
        .single();

      const { data, error } = await supabase
        .from("game_scores")
        .insert({
          game_id: gameId,
          player_id: selectedPlayerId,
          kills: 0,
          deaths: 0,
          assists: 0,
          game_mode: gameMode,
          map_id: mapData?.id || null,
          screenshot_url: screenshotUrl,
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

  if (!availablePlayers?.length) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-secondary/20">
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
  );
}