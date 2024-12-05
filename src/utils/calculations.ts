import { Player } from "@/types/player";

export const calculateHandicap = (kills: number, deaths: number, assists: number): number => {
  const kda = (kills + assists) / Math.max(deaths, 1);
  // Scale KDA to a 1-10 range
  return Math.min(Math.max(Math.round(kda * 2), 1), 10);
};

export const balanceTeams = (players: Player[], shuffleKey: number = 0): { teamA: Player[]; teamB: Player[] } => {
  const selectedPlayers = players.filter(p => p.isSelected);
  
  // If we don't have enough players for two teams, return empty teams
  if (selectedPlayers.length < 2) {
    return { teamA: [], teamB: [] };
  }

  // Create a copy of players and shuffle them based on the key
  const shuffledPlayers = [...selectedPlayers].sort(() => {
    // Use shuffleKey to create different but deterministic shuffles
    return Math.sin(shuffleKey * 9999) - 0.5;
  });

  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let teamAScore = 0;
  let teamBScore = 0;

  // Sort players by handicap for better distribution
  const sortedPlayers = shuffledPlayers.sort((a, b) => b.handicap - a.handicap);

  // Distribute players to teams trying to maintain balance
  sortedPlayers.forEach((player) => {
    // Always assign to the team with lower total handicap
    if (teamAScore <= teamBScore) {
      teamA.push(player);
      teamAScore += player.handicap;
    } else {
      teamB.push(player);
      teamBScore += player.handicap;
    }
  });

  // If teams are significantly unbalanced, try to swap players to achieve better balance
  const maxAttempts = 100;
  let attempts = 0;
  
  while (Math.abs(teamAScore - teamBScore) > 1 && attempts < maxAttempts) {
    for (let i = 0; i < teamA.length; i++) {
      for (let j = 0; j < teamB.length; j++) {
        const scoreDiff = teamAScore - teamBScore;
        const swapDiff = teamB[j].handicap - teamA[i].handicap;
        
        // If swapping these players would improve balance, do it
        if (Math.abs(scoreDiff - 2 * swapDiff) < Math.abs(scoreDiff)) {
          // Swap players
          const tempPlayer = teamA[i];
          teamA[i] = teamB[j];
          teamB[j] = tempPlayer;
          
          // Update scores
          teamAScore = teamA.reduce((sum, p) => sum + p.handicap, 0);
          teamBScore = teamB.reduce((sum, p) => sum + p.handicap, 0);
          
          // If we achieved good balance, exit
          if (Math.abs(teamAScore - teamBScore) <= 1) {
            return { teamA, teamB };
          }
        }
      }
    }
    attempts++;
  }

  return { teamA, teamB };
};