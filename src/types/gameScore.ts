export interface GameScore {
  id?: string;
  game_id: string;
  player_id: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
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
  max_game_score?: number | null;
}