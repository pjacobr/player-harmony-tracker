import { useState } from "react";
import { Player } from "@/types/player";
import { useToast } from "@/components/ui/use-toast";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { ScoreForm } from "./ScoreForm";

interface MatchScoreFormProps {
  selectedPlayers: Player[];
  onScoreSubmit: (scores: { id: string; kills: number; deaths: number; assists: number }[]) => void;
}

export const MatchScoreForm = ({ selectedPlayers, onScoreSubmit }: MatchScoreFormProps) => {
  const { toast } = useToast();
  const [scores, setScores] = useState<{ [key: string]: { kills: number; deaths: number; assists: number } }>(
    selectedPlayers.reduce((acc, player) => ({
      ...acc,
      [player.id]: { kills: 0, deaths: 0, assists: 0 }
    }), {})
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scoreArray = Object.entries(scores).map(([id, stats]) => ({
      id,
      ...stats
    }));

    onScoreSubmit(scoreArray);
    toast({
      title: "Success",
      description: "Match scores have been recorded",
    });
  };

  const handleScoreChange = (playerId: string, field: 'kills' | 'deaths' | 'assists', value: string) => {
    const numValue = parseInt(value) || 0;
    setScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: numValue
      }
    }));
  };

  const handleScoresDetected = (detectedScores: { id: string; kills: number; deaths: number; assists: number }[]) => {
    console.log("Received detected scores:", detectedScores);
    
    const newScores = { ...scores };
    
    const playerNameMap = selectedPlayers.reduce((acc, player) => {
      acc[player.name.toLowerCase()] = player.id;
      return acc;
    }, {} as { [key: string]: string });
    
    console.log("Player name to ID map:", playerNameMap);
    
    detectedScores.forEach(({ id: playerName, kills, deaths, assists }) => {
      const playerId = playerNameMap[playerName.toLowerCase()];
      
      console.log(`Looking for player: ${playerName}, Found ID: ${playerId}`);
      
      if (playerId && newScores[playerId]) {
        newScores[playerId] = { kills, deaths, assists };
        console.log(`Updating scores for player ${playerId}:`, { kills, deaths, assists });
      }
    });

    setScores(newScores);
    console.log('Updated scores state:', newScores);
  };

  if (selectedPlayers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ScreenshotUpload 
        onScoresDetected={handleScoresDetected}
        players={selectedPlayers}
      />
      <ScoreForm
        selectedPlayers={selectedPlayers}
        scores={scores}
        onScoreChange={handleScoreChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};