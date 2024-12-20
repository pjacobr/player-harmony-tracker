import { GameScore } from "@/types/gameScore";
import { GameScoreCard } from "./GameScoreCard";
import { AddPlayerForm } from "./AddPlayerForm";

interface GameScoreListProps {
  scores: GameScore[];
  gameId: string;
  gameMode: string;
  mapName: string | undefined;
  screenshotUrl: string | null;
}

export function GameScoreList({ scores, gameId, gameMode, mapName, screenshotUrl }: GameScoreListProps) {
  return (
    <div className="space-y-2 bg-gaming-card rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[1fr,auto,auto] gap-2 p-3 bg-gaming-background/80 text-sm text-gaming-muted">
        <div>Player</div>
        <div className="hidden sm:block text-center">Team</div>
        <div className="text-right">Score/K/A/D</div>
      </div>
      
      {/* Score rows */}
      <div className="divide-y divide-gaming-border">
        {scores
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map((score) => (
            <GameScoreCard 
              key={score.player_id} 
              score={{
                ...score,
                id: score.id || score.player_id
              }} 
            />
          ))}
      </div>

      <AddPlayerForm
        gameId={gameId}
        gameMode={gameMode}
        mapName={mapName}
        screenshotUrl={screenshotUrl}
        existingPlayerIds={scores.map(s => s.player_id)}
      />
    </div>
  );
}