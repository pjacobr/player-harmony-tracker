import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void;
}

export const AddPlayerForm = ({ onAddPlayer }: AddPlayerFormProps) => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const { toast } = useToast();

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player name",
        variant: "destructive",
      });
      return;
    }

    onAddPlayer(newPlayerName);
    setNewPlayerName("");
  };

  return (
    <div className="flex gap-4 mb-8">
      <Input
        placeholder="Enter player name"
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        className="max-w-xs"
      />
      <Button onClick={handleAddPlayer}>Add Player</Button>
    </div>
  );
};