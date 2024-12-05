import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";

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
          player:players(name)
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
        {games?.map((game) => (
          <AccordionItem key={game.id} value={game.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between w-full pr-4">
                <span>
                  {game.game_mode || "Unknown Mode"} -{" "}
                  {format(new Date(game.created_at), "MMM d, yyyy h:mm a")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {game.scores.length} players
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {game.scores
                  .sort((a: GameScore, b: GameScore) => b.kills - a.kills)
                  .map((score: GameScore) => (
                    <div
                      key={score.player_id}
                      className={`flex justify-between items-center p-2 rounded ${
                        score.won
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      <span className="font-medium">{score.player.name}</span>
                      <div className="flex gap-4">
                        {score.team_number && (
                          <span>Team {score.team_number}</span>
                        )}
                        <span>
                          {score.kills}/{score.deaths}/{score.assists}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}