interface GameScoreProps {
  score: {
    player_id: string;
    player: {
      name: string;
    };
    kills: number;
    deaths: number;
    assists: number;
    won: boolean;
    team_number: number | null;
  };
}

export function GameScoreCard({ score }: GameScoreProps) {
  return (
    <div
      className={`flex justify-between items-center p-2 rounded ${
        score.won
          ? "bg-green-500/10 text-green-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      <span className="font-medium w-40">{score.player.name}</span>
      <div className="flex gap-8">
        {score.team_number && (
          <span className="w-20">Team {score.team_number}</span>
        )}
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-gaming-muted">Kills</span>
            <span>{score.kills}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gaming-muted">Deaths</span>
            <span>{score.deaths}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gaming-muted">Assists</span>
            <span>{score.assists}</span>
          </div>
        </div>
      </div>
    </div>
  );
}