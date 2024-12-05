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
    
    // Create a map of lowercase player names to their IDs
    const playerNameMap = selectedPlayers.reduce((acc, player) => {
      acc[player.name.toLowerCase()] = player.id;
      return acc;
    }, {} as { [key: string]: string });
    
    console.log("Player name to ID map:", playerNameMap);
    
    // For each detected score, find the matching player by name and update their score
    detectedScores.forEach(({ id: playerName, kills, deaths, assists }) => {
      // Find the player ID using the name map
      const playerId = playerNameMap[playerName.toLowerCase()];
      
      if (playerId) {
        console.log(`Updating scores for player ${playerName} (ID: ${playerId}):`, { kills, deaths, assists });
        newScores[playerId] = { kills, deaths, assists };
      } else {
        console.log(`No matching player found for name: ${playerName}`);
      }
    });

    console.log('Updated scores state:', newScores);
    setScores(newScores);
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