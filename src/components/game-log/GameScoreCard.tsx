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
      <span className="font-medium">{score.player.name}</span>
      <div className="flex gap-4">
        {score.team_number && <span>Team {score.team_number}</span>}
        <span>
          {score.kills}/{score.deaths}/{score.assists}
        </span>
      </div>
    </div>
  );
}