import { supabase } from "@/integrations/supabase/client";
import { GameScore } from "@/types/gameScore";

export async function reanalyzeScreenshot(game: {
  id: string;
  screenshot_url: string | null;
  scores: GameScore[];
  game_mode: string;
  created_at: string;
}) {
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
          map_id: null
        };
      }).filter(Boolean)
    );

  if (updateError) throw updateError;
  return result;
}