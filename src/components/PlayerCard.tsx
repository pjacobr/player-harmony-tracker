import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PlayerCardProps {
  player: Player;
  onUpdate: (updatedPlayer: Player) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
}

export const PlayerCard = ({ player, onUpdate, onDelete, onToggleSelect }: PlayerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center justify-between p-2 bg-gaming-card/50 hover:bg-gaming-card transition-colors rounded">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold w-40">{player.name}</span>
          <div className="flex gap-4 text-sm text-gaming-muted">
            <span>K: {player.kills}</span>
            <span>D: {player.deaths}</span>
            <span>A: {player.assists}</span>
          </div>
          <span className="text-gaming-accent font-bold">H: {player.handicap}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => onDelete(player.id)}>Delete</Button>
          <Button
            variant={player.isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSelect(player.id)}
          >
            {player.isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
};