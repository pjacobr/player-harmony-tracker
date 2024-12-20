export interface BoxWhiskerData {
  name: string;
  min?: number;
  q1?: number;
  median?: number;
  q3?: number;
  max?: number;
  average?: number;
  kdSpread: number;
  games?: Array<{
    game_id: string;
    kills: number;
    team_number: number | null;
    game_mode: string | null;
  }>;
}