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
import { GameScore } from "@/types/gameScore";
import { GameScreenshot } from "./GameScreenshot";

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
      max_game_score: number | null;
      score: number;
    }>;
  };
}

export function GameItem({ game }: GameItemProps) {
  const { winners, winningTeam } = calculateWinner(game.scores, game.game_mode);
  const maxGameScore = game.scores[0]?.max_game_score;

  // Map the scores to include all required GameScore properties
  const mappedScores: GameScore[] = game.scores.map(score => ({
    id: score.id,
    game_id: game.id,
    player_id: score.player_id,
    kills: score.kills,
    deaths: score.deaths,
    assists: score.assists,
    score: score.score || 0,
    won: score.won,
    created_at: game.created_at,
    game_mode: game.game_mode,
    team_number: score.team_number,
    screenshot_url: game.screenshot_url,
    map: game.map,
    player: score.player,
    max_game_score: score.max_game_score
  }));

  return (
    <AccordionItem value={game.id}>
      <AccordionTrigger className="hover:no-underline">
        <GameHeader
          gameMode={game.game_mode}
          mapName={game.map?.name}
          createdAt={game.created_at}
          winners={winners}
          winningTeam={winningTeam}
          maxGameScore={maxGameScore}
        />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {game.screenshot_url && (
            <GameScreenshot url={game.screenshot_url} />
          )}
          
          <GameScoreList
            scores={mappedScores}
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