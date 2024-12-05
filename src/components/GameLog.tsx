import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GameHeader } from "./game-log/GameHeader";
import { GameScoreCard } from "./game-log/GameScoreCard";

interface GameScore {
  game_id: string;
  player_id: string;
  kills: number;
  deaths: number;
  assists: number;
  won: boolean;
  created_at: string;
  game_mode: string;
  team_number: number | null;
  screenshot_url: string | null;
  map: {
    name: string;
  } | null;
  player: {
    name: string;
  };
}

export function GameLog() {
  const { data: games, isLoading } = useQuery({
    queryKey: ["game-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_scores")
        .select(`
          game_id,
          player_id,
          kills,
          deaths,
          assists,
          won,
          created_at,
          game_mode,
          team_number,
          screenshot_url,
          map:maps!game_scores_map_id_fkey(name),
          player:players!fk_player(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by game_id
      const gameMap = (data as GameScore[]).reduce((acc, score) => {
        if (!acc[score.game_id]) {
          acc[score.game_id] = {
            id: score.game_id,
            created_at: score.created_at,
            game_mode: score.game_mode,
            map: score.map,
            screenshot_url: score.screenshot_url,
            scores: [],
          };
        }
        acc[score.game_id].scores.push(score);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(gameMap);
    },
  });

  if (isLoading) {
    return <div>Loading game logs...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Game Logs</h2>
      <Accordion type="single" collapsible className="w-full">
        {games?.map((game) => {
          const winners = game.scores
            .filter((s: GameScore) => s.won)
            .map((s: GameScore) => s.player.name)
            .join(", ");

          const winningTeam = game.scores.find((s: GameScore) => s.won)
            ?.team_number;

          return (
            <AccordionItem key={game.id} value={game.id}>
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
                      .sort((a: GameScore, b: GameScore) => b.kills - a.kills)
                      .map((score: GameScore) => (
                        <GameScoreCard key={score.player_id} score={score} />
                      ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}