import { Player } from "@/types/player";
import { Card } from "@/components/ui/card";

interface TeamDisplayProps {
  teamA: Player[];
  teamB: Player[];
}

export const TeamDisplay = ({ teamA, teamB }: TeamDisplayProps) => {
  const getTeamScore = (team: Player[]) => 
    team.reduce((acc, player) => acc + player.handicap, 0);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-4 bg-gaming-card">
        <h3 className="text-xl font-bold mb-2 text-gaming-accent">Team A ({getTeamScore(teamA)})</h3>
        <div className="space-y-2">
          {teamA.map(player => (
            <div key={player.id} className="flex justify-between items-center">
              <span>{player.name}</span>
              <span className="text-gaming-muted">H: {player.handicap}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 bg-gaming-card">
        <h3 className="text-xl font-bold mb-2 text-gaming-accent">Team B ({getTeamScore(teamB)})</h3>
        <div className="space-y-2">
          {teamB.map(player => (
            <div key={player.id} className="flex justify-between items-center">
              <span>{player.name}</span>
              <span className="text-gaming-muted">H: {player.handicap}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};