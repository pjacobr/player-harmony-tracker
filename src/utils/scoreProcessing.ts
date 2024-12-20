import { Player } from "@/types/player";
import { findBestMatchingPlayer } from "./playerMatching";

interface ProcessedScore {
  id: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  team: number | null;
  won: boolean;
}

export const processScores = (
  parsedScores: Record<string, any>,
  players: Player[],
  winningTeam: number | null
): ProcessedScore[] => {
  return Object.entries(parsedScores)
    .filter(([_, scores]) => scores !== null)
    .map(([name, scores]: [string, any]) => {
      const player = findBestMatchingPlayer(name, players);
      console.log(`Matching "${name}" with players:`, player?.name || 'No match found');
      
      if (player && scores) {
        return {
          id: player.id,
          kills: scores.kills || 0,
          deaths: scores.deaths || 0,
          assists: scores.assists || 0,
          score: scores.score || 0,
          team: scores.team || null,
          won: scores.team === winningTeam
        };
      }
      return null;
    })
    .filter(Boolean) as ProcessedScore[];
};

export const prepareGameScoreRows = (
  scores: ProcessedScore[],
  gameId: string,
  mapId: string,
  gameMode: string,
  screenshotUrl: string
) => {
  return scores.map(score => ({
    game_id: gameId,
    player_id: score.id,
    kills: score.kills,
    deaths: score.deaths,
    assists: score.assists,
    score: score.score,
    map_id: mapId,
    game_mode: gameMode,
    team_number: score.team,
    won: score.won,
    screenshot_url: screenshotUrl
  }));
};