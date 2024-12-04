import { useState } from "react";
import { Player } from "@/types/player";
import { PlayerCard } from "@/components/PlayerCard";
import { TeamDisplay } from "@/components/TeamDisplay";
import { MatchScoreForm } from "@/components/MatchScoreForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateHandicap, balanceTeams } from "@/utils/calculations";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [players, setPlayers] = useState<Player[]>([]);
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

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName,
      kills: 0,
      deaths: 0,
      assists: 0,
      handicap: calculateHandicap(0, 0, 0),
      isSelected: false,
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName("");
    toast({
      title: "Success",
      description: "Player added successfully",
    });
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    toast({
      title: "Success",
      description: "Player updated successfully",
    });
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    toast({
      title: "Success",
      description: "Player deleted successfully",
    });
  };

  const handleToggleSelect = (id: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, isSelected: !p.isSelected } : p));
  };

  const handleMatchScores = (scores: { id: string; kills: number; deaths: number; assists: number }[]) => {
    setPlayers(players.map(player => {
      const matchScore = scores.find(score => score.id === player.id);
      if (matchScore) {
        const newKills = player.kills + matchScore.kills;
        const newDeaths = player.deaths + matchScore.deaths;
        const newAssists = player.assists + matchScore.assists;
        return {
          ...player,
          kills: newKills,
          deaths: newDeaths,
          assists: newAssists,
          handicap: calculateHandicap(newKills, newDeaths, newAssists)
        };
      }
      return player;
    }));
  };

  const { teamA, teamB } = balanceTeams(players);
  const selectedPlayers = players.filter(p => p.isSelected);

  return (
    <div className="min-h-screen bg-gaming-background text-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Player Handicap Tracker</h1>
        
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAddPlayer}>Add Player</Button>
        </div>

        {selectedPlayers.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Balanced Teams</h2>
              <TeamDisplay teamA={teamA} teamB={teamB} />
            </div>
            
            <div className="mb-8">
              <MatchScoreForm
                selectedPlayers={selectedPlayers}
                onScoreSubmit={handleMatchScores}
              />
            </div>
          </>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                onUpdate={handleUpdatePlayer}
                onDelete={handleDeletePlayer}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;