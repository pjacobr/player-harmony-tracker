import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { calculateHandicap } from "@/utils/calculations";

interface PlayerCardProps {
  player: Player;
  onUpdate: (updatedPlayer: Player) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
}

export const PlayerCard = ({ player, onUpdate, onDelete, onToggleSelect }: PlayerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState(player);

  const handleSave = () => {
    const handicap = calculateHandicap(editedPlayer.kills, editedPlayer.deaths, editedPlayer.assists);
    onUpdate({ ...editedPlayer, handicap });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gaming-card/50 hover:bg-gaming-card transition-colors rounded">
      {isEditing ? (
        <div className="flex-1 flex gap-2 items-center">
          <Input
            value={editedPlayer.name}
            onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
            className="w-40"
            placeholder="Name"
          />
          <Input
            type="number"
            value={editedPlayer.kills}
            onChange={(e) => setEditedPlayer({ ...editedPlayer, kills: parseInt(e.target.value) || 0 })}
            className="w-16"
            placeholder="K"
          />
          <Input
            type="number"
            value={editedPlayer.deaths}
            onChange={(e) => setEditedPlayer({ ...editedPlayer, deaths: parseInt(e.target.value) || 0 })}
            className="w-16"
            placeholder="D"
          />
          <Input
            type="number"
            value={editedPlayer.assists}
            onChange={(e) => setEditedPlayer({ ...editedPlayer, assists: parseInt(e.target.value) || 0 })}
            className="w-16"
            placeholder="A"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save</Button>
          </div>
        </div>
      ) : (
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
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
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
      )}
    </div>
  );
};