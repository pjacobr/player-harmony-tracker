import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Accordion } from "@/components/ui/accordion";
import { GameItem } from "./game-log/GameItem";
import { GameScore } from "@/types/gameScore";
import { GameAnalytics } from "./game-log/GameAnalytics";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function GameLog() {
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  const { data: games, isLoading } = useQuery({
    queryKey: ["game-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select(`
          id,
          created_at,
          game_mode,
          screenshot_url,
          max_game_score,
          map:maps!games_map_id_fkey(name),
          game_scores(
            id,
            player_id,
            kills,
            deaths,
            assists,
            score,
            won,
            team_number,
            player:players!fk_player(name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((game) => ({
        ...game,
        scores: game.game_scores,
      }));
    },
  });

  if (isLoading) {
    return <div>Loading game logs...</div>;
  }

  const totalGames = games?.length || 0;
  const totalPages = Math.ceil(totalGames / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = games?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Game Logs</h2>
      <GameAnalytics />
      <Accordion type="single" collapsible className="w-full">
        {currentGames.map((game) => (
          <GameItem key={game.id} game={game} />
        ))}
      </Accordion>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}