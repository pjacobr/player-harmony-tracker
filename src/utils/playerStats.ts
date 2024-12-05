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
      player1Game.team_number === player2Game.team_number
    );
  });

  if (sharedGames.length === 0) {
    return {
      gamesPlayed: 0,
      winRate: 0,
      avgKDA: 0
    };
  }

  // Calculate combined KDA for games played together
  const totalKills = sharedGames.reduce((sum, game) => sum + game.kills, 0);
  const totalDeaths = sharedGames.reduce((sum, game) => sum + game.deaths, 0);
  const totalAssists = sharedGames.reduce((sum, game) => sum + game.assists, 0);
  
  const avgKDA = (totalKills + totalAssists) / Math.max(totalDeaths, 1);

  // For this example, we'll use a simple win rate calculation
  // You might want to adjust this based on your actual game scoring system
  const winRate = sharedGames.length > 0 ? 
    sharedGames.filter(game => (game.kills + game.assists) > game.deaths).length / sharedGames.length : 0;

  return {
    gamesPlayed: sharedGames.length,
    winRate,
    avgKDA
  };
};
