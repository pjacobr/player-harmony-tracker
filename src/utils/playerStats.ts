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