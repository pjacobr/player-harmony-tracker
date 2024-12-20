import { format } from "date-fns";

interface GameHeaderProps {
  gameMode: string;
  mapName: string | undefined;
  createdAt: string;
  winners: string;
  winningTeam: number | undefined;
  maxGameScore: number | undefined;
}

export function GameHeader({
  gameMode,
  mapName,
  createdAt,
  winners,
  winningTeam,
  maxGameScore,
}: GameHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between w-full pr-4 gap-2">
      <span>
        {gameMode || "Unknown Mode"} - {mapName || "Unknown Map"} -{" "}
        {format(new Date(createdAt), "MMM d, yyyy h:mm a")}
      </span>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          Winner: {winningTeam ? `Team ${winningTeam}` : winners}
        </span>
        {maxGameScore !== undefined && (
          <span>
            Max Score: {maxGameScore}
          </span>
        )}
      </div>
    </div>
  );
}