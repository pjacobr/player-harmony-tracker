import { Player } from "@/types/player";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
  onShuffle?: () => void;
}

export const TeamDisplay = ({ teamA, teamB, onShuffle }: TeamDisplayProps) => {
  const getTeamScore = (team: Player[]) => 
    team.reduce((acc, player) => acc + player.handicap, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Balanced Teams</h2>
        {onShuffle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShuffle}
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle Teams
          </Button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 bg-card">
          <h3 className="text-xl font-bold mb-2 text-accent">Team A ({getTeamScore(teamA)})</h3>
          <div className="space-y-2">
            {teamA.map(player => (
              <div key={player.id} className="flex justify-between items-center">
                <span className="text-foreground">{player.name}</span>
                <span className="text-muted-foreground">H: {player.handicap}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4 bg-card">
          <h3 className="text-xl font-bold mb-2 text-accent">Team B ({getTeamScore(teamB)})</h3>
          <div className="space-y-2">
            {teamB.map(player => (
              <div key={player.id} className="flex justify-between items-center">
                <span className="text-foreground">{player.name}</span>
                <span className="text-muted-foreground">H: {player.handicap}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};