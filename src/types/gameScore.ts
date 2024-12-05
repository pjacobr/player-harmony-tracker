export interface GameScore {
  id?: string;  // Make id optional to maintain backwards compatibility
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