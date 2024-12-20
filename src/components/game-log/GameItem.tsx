import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GameHeader } from "./GameHeader";
import { calculateWinner } from "@/utils/gameWinnerUtils";
import { GameScoreList } from "./GameScoreList";
import { GameScore } from "@/types/gameScore";
import { GameScreenshot } from "./GameScreenshot";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reanalyzeScreenshot = useMutation({
    mutationFn: async () => {
      if (!game.screenshot_url) {
        throw new Error("No screenshot available for this game");
      }

      const playerNames = game.scores.map(score => score.player.name);
      
      console.log('Reanalyzing screenshot:', game.screenshot_url);
      console.log('Players to match:', playerNames);

      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-screenshot', {
          body: { 
            imageUrl: game.screenshot_url,
            playerNames: playerNames
          },
        });

      if (analysisError) throw analysisError;

      const result = JSON.parse(analysisData.result);
      console.log('Analysis result:', result);

      // Update all scores for this game
      const { error: updateError } = await supabase
        .from('game_scores')
        .upsert(
          Object.entries(result.scores).map(([playerName, stats]: [string, any]) => {
            const player = game.scores.find(s => s.player.name === playerName);
            if (!player) return null;

            return {
              id: player.id,
              player_id: player.player_id,
              game_id: game.id,
              kills: stats.kills || 0,
              deaths: stats.deaths || 0,
              assists: stats.assists || 0,
              score: stats.score || 0,
              team_number: stats.team || null,
              won: stats.team === result.winningTeam,
              game_mode: game.game_mode,
              created_at: game.created_at,
              screenshot_url: game.screenshot_url,
              map_id: null // Since we don't have access to map_id in this context
            };
          }).filter(Boolean)
        );

      if (updateError) throw updateError;
      return result;
    },
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
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reanalyzeScreenshot.mutate()}
                  disabled={reanalyzeScreenshot.isPending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {reanalyzeScreenshot.isPending ? "Reanalyzing..." : "Reanalyze Screenshot"}
                </Button>
              </div>
              <GameScreenshot url={game.screenshot_url} />
            </div>
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