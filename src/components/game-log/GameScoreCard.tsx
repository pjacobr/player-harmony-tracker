import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Edit2, Save, X } from "lucide-react";

interface GameScoreProps {
  score: {
    id: string;
    player_id: string;
    player: {
      name: string;
    };
    kills: number;
    deaths: number;
    assists: number;
    won: boolean;
    team_number: number | null;
  };
}

export function GameScoreCard({ score }: GameScoreProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScore, setEditedScore] = useState({
    kills: score.kills,
    deaths: score.deaths,
    assists: score.assists,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateScoreMutation = useMutation({
    mutationFn: async (updatedScore: typeof editedScore) => {
      const { error } = await supabase
        .from("game_scores")
        .update(updatedScore)
        .eq("id", score.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-logs"] });
      setIsEditing(false);
      toast({
        title: "Score Updated",
        description: "The game score has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update score: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateScoreMutation.mutate(editedScore);
  };

  const handleCancel = () => {
    setEditedScore({
      kills: score.kills,
      deaths: score.deaths,
      assists: score.assists,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`flex justify-between items-center p-2 rounded ${
        score.won
          ? "bg-green-500/10 text-green-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      <span className="font-medium w-40">{score.player.name}</span>
      <div className="flex gap-8">
        {score.team_number && (
          <span className="w-20">Team {score.team_number}</span>
        )}
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-gaming-muted">Kills</span>
            {isEditing ? (
              <Input
                type="number"
                value={editedScore.kills}
                onChange={(e) =>
                  setEditedScore({
                    ...editedScore,
                    kills: parseInt(e.target.value) || 0,
                  })
                }
                className="w-16 h-8 text-center"
              />
            ) : (
              <span>{score.kills}</span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gaming-muted">Deaths</span>
            {isEditing ? (
              <Input
                type="number"
                value={editedScore.deaths}
                onChange={(e) =>
                  setEditedScore({
                    ...editedScore,
                    deaths: parseInt(e.target.value) || 0,
                  })
                }
                className="w-16 h-8 text-center"
              />
            ) : (
              <span>{score.deaths}</span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gaming-muted">Assists</span>
            {isEditing ? (
              <Input
                type="number"
                value={editedScore.assists}
                onChange={(e) =>
                  setEditedScore({
                    ...editedScore,
                    assists: parseInt(e.target.value) || 0,
                  })
                }
                className="w-16 h-8 text-center"
              />
            ) : (
              <span>{score.assists}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}