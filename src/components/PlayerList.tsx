import { Player } from "@/types/player";
import { PlayerCard } from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
  onToggleSelect: (id: string) => void;
}

export const PlayerList = ({ players, onUpdatePlayer, onDeletePlayer, onToggleSelect }: PlayerListProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Players</h2>
      <div className="space-y-2">
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onUpdate={onUpdatePlayer}
            onDelete={onDeletePlayer}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
};