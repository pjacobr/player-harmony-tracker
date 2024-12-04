import { Player } from "@/types/player";

export const calculateHandicap = (kills: number, deaths: number, assists: number): number => {
  const kda = (kills + assists) / Math.max(deaths, 1);
  // Scale KDA to a 1-10 range
  return Math.min(Math.max(Math.round(kda * 2), 1), 10);
};

export const balanceTeams = (players: Player[]): { teamA: Player[]; teamB: Player[] } => {
  const selectedPlayers = players.filter(p => p.isSelected);
  const sortedPlayers = [...selectedPlayers].sort((a, b) => b.handicap - a.handicap);
  
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let teamAScore = 0;
  let teamBScore = 0;

  sortedPlayers.forEach(player => {
    if (teamAScore <= teamBScore) {
      teamA.push(player);
      teamAScore += player.handicap;
    } else {
      teamB.push(player);
      teamBScore += player.handicap;
    }
  });

  return { teamA, teamB };
};