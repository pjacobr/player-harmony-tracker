import { format } from "date-fns";

interface GameHeaderProps {
  gameMode: string;
  mapName: string | undefined;
  createdAt: string;
  winners: string;
  winningTeam: number | undefined;
}

export function GameHeader({
  gameMode,
  mapName,
  createdAt,
  winners,
  winningTeam,
}: GameHeaderProps) {
  return (
    <div className="flex justify-between w-full pr-4">
      <span>
        {gameMode || "Unknown Mode"} - {mapName || "Unknown Map"} -{" "}
        {format(new Date(createdAt), "MMM d, yyyy h:mm a")}
      </span>
      <span className="text-sm text-muted-foreground">
        Winner: {winningTeam ? `Team ${winningTeam}` : winners}
      </span>
    </div>
  );
}