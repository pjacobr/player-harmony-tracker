import { useState } from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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

  if (selectedPlayers.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gaming-card">
      <h2 className="text-xl font-bold mb-4 text-gaming-accent">Record Match Scores</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedPlayers.map(player => (
          <div key={player.id} className="space-y-2">
            <h3 className="font-semibold">{player.name}</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Kills</span>
                <Input
                  type="number"
                  placeholder="Kills"
                  min="0"
                  value={scores[player.id]?.kills || 0}
                  onChange={(e) => handleScoreChange(player.id, 'kills', e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Deaths</span>
                <Input
                  type="number"
                  placeholder="Deaths"
                  min="0"
                  value={scores[player.id]?.deaths || 0}
                  onChange={(e) => handleScoreChange(player.id, 'deaths', e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Assists</span>
                <Input
                  type="number"
                  placeholder="Assists"
                  min="0"
                  value={scores[player.id]?.assists || 0}
                  onChange={(e) => handleScoreChange(player.id, 'assists', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="submit" className="w-full">Record Scores</Button>
      </form>
    </Card>
  );
};