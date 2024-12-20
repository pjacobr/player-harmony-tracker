export interface GameScore {
  id: string;
  game_id: string;
  player_id: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  won: boolean;
  created_at: string;
  team_number: number | null;
  player: {
    name: string;
  };
}

export interface Game {
  id: string;
  created_at: string;
  game_mode: string;
  map: {
    name: string;
  } | null;
  screenshot_url: string | null;
  max_game_score: number | null;
  scores: GameScore[];
}