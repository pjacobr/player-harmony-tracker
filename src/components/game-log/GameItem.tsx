import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GameHeader } from "./GameHeader";
import { calculateWinner } from "@/utils/gameWinnerUtils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GameScoreList } from "./GameScoreList";

interface GameItemProps {
  game: {
    id: string;
    created_at: string;
    game_mode: string;
    map: {
      name: string;
    } | null;
    screenshot_url: string | null;
    scores: Array<{
      id: string;
      player_id: string;
      player: {
        name: string;
      };
      kills: number;
      deaths: number;
      assists: number;
      won: boolean;
      team_number: number | null;
    }>;
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
            <Dialog>
              <DialogTrigger asChild>
                <div className="rounded-lg overflow-hidden max-w-2xl mx-auto cursor-pointer transition-transform hover:scale-[1.02]">
                  <img
                    src={game.screenshot_url}
                    alt="Game Screenshot"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] w-fit p-0 bg-transparent border-0">
                <img
                  src={game.screenshot_url}
                  alt="Game Screenshot"
                  className="w-auto max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                />
              </DialogContent>
            </Dialog>
          )}
          
          <GameScoreList
            scores={game.scores}
            gameId={game.id}
            gameMode={game.game_mode}
            mapName={game.map?.name}
            screenshotUrl={game.screenshot_url}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}