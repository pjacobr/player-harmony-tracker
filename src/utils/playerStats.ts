import { GameStats } from "@/types/gameStats";

export const calculatePlayerAverages = (gameStats: GameStats[], players: Array<{ id: string; name: string }>) => {
  if (!gameStats || gameStats.length === 0) return [];

  return players.map(player => {
    const playerGames = gameStats.filter(game => game.player_id === player.id);
    const totalGames = playerGames.length || 1;

    return {
      name: player.name,
      avgKills: Number((playerGames.reduce((sum, game) => sum + game.kills, 0) / totalGames).toFixed(2)),
      avgDeaths: Number((playerGames.reduce((sum, game) => sum + game.deaths, 0) / totalGames).toFixed(2)),
      avgAssists: Number((playerGames.reduce((sum, game) => sum + game.assists, 0) / totalGames).toFixed(2)),
      kda: Number(((playerGames.reduce((sum, game) => sum + game.kills + game.assists, 0)) / 
            Math.max(playerGames.reduce((sum, game) => sum + game.deaths, 0), 1)).toFixed(2))
    };
  });
};

interface GameResult {
  won: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

interface TeamScores {
  [key: number]: {
    kills: number;
    deaths: number;
    assists: number;
  };
}

export const calculateTeamPerformance = (
  gameStats: any[],
  player1Id: string,
  player2Id: string
) => {
  // Filter games where both players were on the same team
  const sharedGames = gameStats.filter(game => {
    const player1Game = gameStats.find(
      g => g.game_id === game.game_id && g.player_id === player1Id
    );
    const player2Game = gameStats.find(
      g => g.game_id === game.game_id && g.player_id === player2Id
    );
    
    return (
      player1Game &&
      player2Game &&
      player1Game.team_number === player2Game.team_number &&
      player1Game.team_number !== null // Only include team games
    );
  });

  if (sharedGames.length === 0) {
    return {
      gamesPlayed: 0,
      winRate: 0,
      avgKDA: 0
    };
  }

  // Group games by game_id to calculate team performance
  const gameResults = sharedGames.reduce<Record<string, GameResult>>((acc, game) => {
    if (!acc[game.game_id]) {
      // Get all players from this game
      const gamePlayers = gameStats.filter(g => g.game_id === game.game_id);
      
      // Calculate team scores
      const teamScores = gamePlayers.reduce<TeamScores>((scores, player) => {
        if (player.team_number) {
          if (!scores[player.team_number]) {
            scores[player.team_number] = {
              kills: 0,
              deaths: 0,
              assists: 0
            };
          }
          scores[player.team_number].kills += player.kills;
          scores[player.team_number].deaths += player.deaths;
          scores[player.team_number].assists += player.assists;
        }
        return scores;
      }, {});

      // Determine winning team based on kills
      const playerTeam = game.team_number;
      const otherTeam = playerTeam === 1 ? 2 : 1;
      
      const playerTeamScore = teamScores[playerTeam]?.kills || 0;
      const otherTeamScore = teamScores[otherTeam]?.kills || 0;
      
      acc[game.game_id] = {
        won: playerTeamScore > otherTeamScore,
        kills: game.kills,
        deaths: game.deaths,
        assists: game.assists
      };
    }
    return acc;
  }, {});

  const results = Object.values(gameResults);
  const wins = results.filter((result) => result.won).length;
  const totalKills = results.reduce((sum, game) => sum + game.kills, 0);
  const totalDeaths = results.reduce((sum, game) => sum + game.deaths, 0);
  const totalAssists = results.reduce((sum, game) => sum + game.assists, 0);
  
  const avgKDA = (totalKills + totalAssists) / Math.max(totalDeaths, 1);
  const winRate = results.length > 0 ? wins / results.length : 0;

  return {
    gamesPlayed: results.length,
    winRate,
    avgKDA
  };
};