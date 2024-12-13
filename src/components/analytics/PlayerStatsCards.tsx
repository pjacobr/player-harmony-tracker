import { Card } from "@/components/ui/card";
import { GameScore } from "@/types/gameScore";
import { Player } from "@/types/player";
import { calculateKDA } from "@/utils/kdaCalculations";
import { startOfDay } from "date-fns";

interface PlayerStatsCardsProps {
  players: Player[];
  gameStats: GameScore[];
}

export const PlayerStatsCards = ({ players, gameStats }: PlayerStatsCardsProps) => {
  const calculatePlayerStats = (playerId: string, games: GameScore[]) => {
    const playerGames = games.filter(game => game.player_id === playerId);
    const totalKills = playerGames.reduce((sum, game) => sum + game.kills, 0);
    const totalDeaths = playerGames.reduce((sum, game) => sum + game.deaths, 0);
    const totalAssists = playerGames.reduce((sum, game) => sum + game.assists, 0);
    const kda = calculateKDA(totalKills, totalDeaths, totalAssists);
    return { kda, games: playerGames.length };
  };

  // Calculate best and worst players based on KDA
  const playerStats = players.map(player => {
    const stats = calculatePlayerStats(player.id, gameStats);
    return {
      ...player,
      ...stats,
    };
  }).filter(player => player.games > 0);

  const bestPlayer = playerStats.length > 0 
    ? playerStats.reduce((prev, current) => 
        prev.kda > current.kda ? prev : current
      )
    : null;

  const worstPlayer = playerStats.length > 0
    ? playerStats.reduce((prev, current) => 
        prev.kda < current.kda ? prev : current
      )
    : null;

  // Calculate player of the day based on today's games
  const today = startOfDay(new Date());
  const todaysGames = gameStats.filter(game => 
    startOfDay(new Date(game.created_at)).getTime() === today.getTime()
  );

  const playerOfTheDay = players.map(player => {
    const stats = calculatePlayerStats(player.id, todaysGames);
    return {
      ...player,
      ...stats,
    };
  })
  .filter(player => player.games > 0)
  .reduce((prev, current) => 
    prev?.kda > current.kda ? prev : current
  , null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 bg-gaming-card">
        <h3 className="text-lg font-semibold mb-2">Overall Best Player</h3>
        {bestPlayer ? (
          <div>
            <p className="text-xl font-bold text-primary">{bestPlayer.name}</p>
            <p className="text-sm text-gaming-muted">KDA: {bestPlayer.kda.toFixed(2)}</p>
            <p className="text-sm text-gaming-muted">Games: {bestPlayer.games}</p>
          </div>
        ) : (
          <p className="text-gaming-muted">No data available</p>
        )}
      </Card>

      <Card className="p-4 bg-gaming-card">
        <h3 className="text-lg font-semibold mb-2">Player of the Day</h3>
        {playerOfTheDay ? (
          <div>
            <p className="text-xl font-bold text-primary">{playerOfTheDay.name}</p>
            <p className="text-sm text-gaming-muted">KDA: {playerOfTheDay.kda.toFixed(2)}</p>
            <p className="text-sm text-gaming-muted">Games Today: {playerOfTheDay.games}</p>
          </div>
        ) : (
          <p className="text-gaming-muted">No games played today</p>
        )}
      </Card>

      <Card className="p-4 bg-gaming-card">
        <h3 className="text-lg font-semibold mb-2">Needs Improvement</h3>
        {worstPlayer ? (
          <div>
            <p className="text-xl font-bold text-primary">{worstPlayer.name}</p>
            <p className="text-sm text-gaming-muted">KDA: {worstPlayer.kda.toFixed(2)}</p>
            <p className="text-sm text-gaming-muted">Games: {worstPlayer.games}</p>
          </div>
        ) : (
          <p className="text-gaming-muted">No data available</p>
        )}
      </Card>
    </div>
  );
};