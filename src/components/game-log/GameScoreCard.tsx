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
      // Log the data being sent
      console.log('Updating score:', {
        id: score.id,
        updatedScore
      });

      const { data, error } = await supabase
        .from("game_scores")
        .update(updatedScore)
        .eq("id", score.id)
        .select(); // Add select() to get the updated data

      if (error) throw error;
      
      // Log the response
      console.log('Update response:', data);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["game-logs"] });
      setIsEditing(false);
      toast({
        title: "Score Updated",
        description: "The game score has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update score: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Validate the scores before updating
    const validatedScore = {
      kills: Math.max(0, editedScore.kills),
      deaths: Math.max(0, editedScore.deaths),
      assists: Math.max(0, editedScore.assists),
    };

    // Only update if values have actually changed
    if (
      validatedScore.kills !== score.kills ||
      validatedScore.deaths !== score.deaths ||
      validatedScore.assists !== score.assists
    ) {
      updateScoreMutation.mutate(validatedScore);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedScore({
      kills: score.kills,
      deaths: score.deaths,
      assists: score.assists,
    });
    setIsEditing(false);
  };

  const handleInputChange = (
    field: 'kills' | 'deaths' | 'assists',
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setEditedScore(prev => ({
      ...prev,
      [field]: Math.max(0, numValue) // Ensure non-negative values
    }));
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
                min="0"
                value={editedScore.kills}
                onChange={(e) => handleInputChange('kills', e.target.value)}
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
                min="0"
                value={editedScore.deaths}
                onChange={(e) => handleInputChange('deaths', e.target.value)}
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
                min="0"
                value={editedScore.assists}
                onChange={(e) => handleInputChange('assists', e.target.value)}
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
                disabled={updateScoreMutation.isPending}
                className="h-8 w-8"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={updateScoreMutation.isPending}
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