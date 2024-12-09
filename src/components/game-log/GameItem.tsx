import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GameHeader } from "./GameHeader";
import { GameScoreCard } from "./GameScoreCard";
import { calculateWinner } from "@/utils/gameWinnerUtils";
import { GameScore } from "@/types/gameScore";

interface GameItemProps {
  game: {
    id: string;
    created_at: string;
    game_mode: string;
    map: {
      name: string;
    } | null;
    screenshot_url: string | null;
    scores: GameScore[];
  };
}

export function GameItem({ game }: GameItemProps) {
  const { winners, winningTeam } = calculateWinner(game.scores, game.game_mode);

  return (
    <AccordionItem value={game.id}>
      <AccordionTrigger className="hover:no-underline">
        <GameHeader
          gameMode={game.game_mode}
          mapName={game.map?.name}
          createdAt={game.created_at}
          winners={winners}
          winningTeam={winningTeam}
        />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {game.screenshot_url && (
            <div className="rounded-lg overflow-hidden max-w-2xl mx-auto">
              <img
                src={game.screenshot_url}
                alt="Game Screenshot"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <div className="space-y-2">
            {game.scores
              .sort((a, b) => b.kills - a.kills)
              .map((score) => (
                <GameScoreCard 
                  key={score.player_id} 
                  score={{
                    ...score,
                    id: score.id || score.player_id  // Fallback to player_id if id is not present
                  }} 
                />
              ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}