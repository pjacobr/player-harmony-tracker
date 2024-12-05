import { Player } from "@/types/player";

export const calculateHandicap = (kills: number, deaths: number, assists: number): number => {
  const kda = (kills + assists) / Math.max(deaths, 1);
  // Scale KDA to a 1-10 range
  return Math.min(Math.max(Math.round(kda * 2), 1), 10);
};

export const balanceTeams = (players: Player[], shuffleKey: number = 0): { teamA: Player[]; teamB: Player[] } => {
  const selectedPlayers = players.filter(p => p.isSelected);
  const sortedPlayers = [...selectedPlayers].sort((a, b) => b.handicap - a.handicap);
  
  // Use the shuffle key to alternate the team assignment pattern
  const isAlternatePattern = shuffleKey % 2 === 1;
  
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let teamAScore = 0;
  let teamBScore = 0;

  sortedPlayers.forEach((player, index) => {
    const shouldGoToTeamA = isAlternatePattern
      ? (index % 2 === 0 ? teamBScore >= teamAScore : teamAScore > teamBScore)
      : teamAScore <= teamBScore;

    if (shouldGoToTeamA) {
      teamA.push(player);
      teamAScore += player.handicap;
    } else {
      teamB.push(player);
      teamBScore += player.handicap;
    }
  });

  return { teamA, teamB };
};