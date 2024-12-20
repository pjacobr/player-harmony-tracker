import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GameHeader } from "./GameHeader";
import { calculateWinner } from "@/utils/gameWinnerUtils";
import { GameScoreList } from "./GameScoreList";
import { Game } from "@/types/gameScore";
import { GameScreenshot } from "./GameScreenshot";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { reanalyzeScreenshot } from "@/utils/gameAnalysis";

interface GameItemProps {
  game: Game;
}

export function GameItem({ game }: GameItemProps) {
  const { winners, winningTeam } = calculateWinner(game.scores, game.game_mode);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reanalyzeScreenshotMutation = useMutation({
    mutationFn: () => reanalyzeScreenshot(game),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-logs'] });
      toast({
        title: "Success",
        description: "Screenshot reanalyzed and scores updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Reanalysis error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reanalyze screenshot",
        variant: "destructive",
      });
    },
  });

  return (
    <AccordionItem value={game.id}>
      <AccordionTrigger className="hover:no-underline">
        <GameHeader
          gameMode={game.game_mode}
          mapName={game.map?.name}
          createdAt={game.created_at}
          winners={winners}
          winningTeam={winningTeam}
          maxGameScore={game.max_game_score}
        />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {game.screenshot_url && (
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reanalyzeScreenshotMutation.mutate()}
                  disabled={reanalyzeScreenshotMutation.isPending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {reanalyzeScreenshotMutation.isPending ? "Reanalyzing..." : "Reanalyze Screenshot"}
                </Button>
              </div>
              <GameScreenshot url={game.screenshot_url} />
            </div>
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