import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerScoreInputs } from "./PlayerScoreInputs";

interface ScoreFormProps {
  selectedPlayers: Player[];
  scores: { [key: string]: { kills: number; deaths: number; assists: number } };
  onScoreChange: (playerId: string, field: 'kills' | 'deaths' | 'assists', value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ScoreForm = ({ selectedPlayers, scores, onScoreChange, onSubmit }: ScoreFormProps) => {
  return (
    <Card className="p-4 bg-gaming-card">
      <h2 className="text-xl font-bold mb-4 text-gaming-accent">Record Match Scores</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {selectedPlayers.map(player => (
          <PlayerScoreInputs
            key={player.id}
            player={player}
            scores={scores}
            onScoreChange={onScoreChange}
          />
        ))}
        <Button type="submit" className="w-full">Record Scores</Button>
      </form>
    </Card>
  );
};