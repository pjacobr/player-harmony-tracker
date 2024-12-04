export interface Player {
  id: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  handicap: number;
  isSelected: boolean;
}