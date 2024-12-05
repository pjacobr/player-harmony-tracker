import { Player } from "@/types/player";
import { Input } from "@/components/ui/input";

interface PlayerScoreInputsProps {
  player: Player;
  scores: { [key: string]: { kills: number; deaths: number; assists: number } };
  onScoreChange: (playerId: string, field: 'kills' | 'deaths' | 'assists', value: string) => void;
}

export const PlayerScoreInputs = ({ player, scores, onScoreChange }: PlayerScoreInputsProps) => {
  return (
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
            onChange={(e) => onScoreChange(player.id, 'kills', e.target.value)}
            className="text-black bg-white"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground mb-1">Deaths</span>
          <Input
            type="number"
            placeholder="Deaths"
            min="0"
            value={scores[player.id]?.deaths || 0}
            onChange={(e) => onScoreChange(player.id, 'deaths', e.target.value)}
            className="text-black bg-white"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground mb-1">Assists</span>
          <Input
            type="number"
            placeholder="Assists"
            min="0"
            value={scores[player.id]?.assists || 0}
            onChange={(e) => onScoreChange(player.id, 'assists', e.target.value)}
            className="text-black bg-white"
          />
        </div>
      </div>
    </div>
  );
};