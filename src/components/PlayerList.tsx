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
    <div className="mt-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Players ({players.length})</h2>
      <div className="space-y-3">
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