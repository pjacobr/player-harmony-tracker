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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-card hover:bg-accent/5 transition-colors rounded gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
        <span className="font-semibold text-lg sm:w-40 break-words text-foreground">{player.name}</span>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Kills: {player.kills}</span>
          <span>Deaths: {player.deaths}</span>
          <span>Assists: {player.assists}</span>
          <span className="text-accent font-bold">Handicap: {player.handicap}</span>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(player.id)}
          className="flex-1 sm:flex-none"
        >
          Delete
        </Button>
        <Button
          variant={player.isSelected ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleSelect(player.id)}
          className="flex-1 sm:flex-none"
        >
          {player.isSelected ? "Selected" : "Select"}
        </Button>
      </div>
    </div>
  );
};