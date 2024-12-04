import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="p-4 bg-gaming-card hover:bg-gaming-card/90 transition-colors">
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editedPlayer.name}
            onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
            className="mb-2"
            placeholder="Name"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={editedPlayer.kills}
              onChange={(e) => setEditedPlayer({ ...editedPlayer, kills: parseInt(e.target.value) || 0 })}
              placeholder="Kills"
            />
            <Input
              type="number"
              value={editedPlayer.deaths}
              onChange={(e) => setEditedPlayer({ ...editedPlayer, deaths: parseInt(e.target.value) || 0 })}
              placeholder="Deaths"
            />
            <Input
              type="number"
              value={editedPlayer.assists}
              onChange={(e) => setEditedPlayer({ ...editedPlayer, assists: parseInt(e.target.value) || 0 })}
              placeholder="Assists"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{player.name}</h3>
            <span className="text-gaming-accent font-bold">H: {player.handicap}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-gaming-muted">
            <div>K: {player.kills}</div>
            <div>D: {player.deaths}</div>
            <div>A: {player.assists}</div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(player.id)}>Delete</Button>
            </div>
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
    </Card>
  );
};