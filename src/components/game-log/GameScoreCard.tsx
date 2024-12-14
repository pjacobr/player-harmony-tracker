import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ScoreInput } from "./ScoreInput";
import { EditControls } from "./EditControls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    team_number: score.team_number,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateScoreMutation = useMutation({
    mutationFn: async (updatedScore: typeof editedScore) => {
      console.log('Updating score:', { id: score.id, updatedScore });
      const { data, error } = await supabase
        .from("game_scores")
        .update(updatedScore)
        .eq("id", score.id)
        .select();

      if (error) throw error;
      console.log('Update response:', data);
      return data;
    },
    onSuccess: () => {
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
    const validatedScore = {
      kills: Math.max(0, editedScore.kills),
      deaths: Math.max(0, editedScore.deaths),
      assists: Math.max(0, editedScore.assists),
      team_number: editedScore.team_number,
    };

    if (
      validatedScore.kills !== score.kills ||
      validatedScore.deaths !== score.deaths ||
      validatedScore.assists !== score.assists ||
      validatedScore.team_number !== score.team_number
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
      team_number: score.team_number,
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: 'kills' | 'deaths' | 'assists', value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedScore(prev => ({
      ...prev,
      [field]: Math.max(0, numValue)
    }));
  };

  const handleTeamChange = (value: string) => {
    setEditedScore(prev => ({
      ...prev,
      team_number: value === "null" ? null : parseInt(value)
    }));
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-2 rounded gap-2 sm:gap-0 ${
        score.won
          ? "bg-green-500/10 text-green-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-8 w-full sm:w-auto">
        <span className="font-medium">{score.player.name}</span>
        {isEditing ? (
          <Select
            value={editedScore.team_number?.toString() ?? "null"}
            onValueChange={handleTeamChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">No Team</SelectItem>
              <SelectItem value="1">Team 1</SelectItem>
              <SelectItem value="2">Team 2</SelectItem>
              <SelectItem value="3">Team 3</SelectItem>
              <SelectItem value="4">Team 4</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          score.team_number && (
            <span className="text-sm">Team {score.team_number}</span>
          )
        )}
      </div>
      
      <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
        <div className="flex gap-4 sm:gap-8 text-sm flex-1 sm:flex-none justify-between sm:justify-start">
          <ScoreInput
            label="Kills"
            value={editedScore.kills}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('kills', value)}
          />
          <ScoreInput
            label="Assists"
            value={editedScore.assists}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('assists', value)}
          />
          <ScoreInput
            label="Deaths"
            value={editedScore.deaths}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('deaths', value)}
          />
        </div>
        
        <EditControls
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
          onEdit={() => setIsEditing(true)}
          isPending={updateScoreMutation.isPending}
        />
      </div>
    </div>
  );
}