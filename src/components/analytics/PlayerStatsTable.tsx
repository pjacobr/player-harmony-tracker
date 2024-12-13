import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sortByName } from "@/utils/sortingUtils";

interface PlayerStatsTableProps {
  playerStats: Array<{
    name: string;
    totalGames: number;
    winRate: string;
    kda: string;
    avgKills: string;
    avgDeaths: string;
    avgAssists: string;
    kdSpread: string;
  }>;
  sortAscending: boolean;
}

export const PlayerStatsTable = ({ playerStats, sortAscending }: PlayerStatsTableProps) => {
  const sortedStats = [...playerStats].sort((a, b) => sortByName(a, b, sortAscending));

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Player Statistics Summary</h3>
      <div className="bg-gaming-card rounded-lg p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Games</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">KDA</TableHead>
              <TableHead className="text-right">Avg Kills</TableHead>
              <TableHead className="text-right">Avg Deaths</TableHead>
              <TableHead className="text-right">Avg Assists</TableHead>
              <TableHead className="text-right">K/D Spread</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((stats) => (
              <TableRow key={stats.name}>
                <TableCell className="font-medium">{stats.name}</TableCell>
                <TableCell className="text-right">{stats.totalGames}</TableCell>
                <TableCell className="text-right">{stats.winRate}%</TableCell>
                <TableCell className="text-right">{stats.kda}</TableCell>
                <TableCell className="text-right">{stats.avgKills}</TableCell>
                <TableCell className="text-right">{stats.avgDeaths}</TableCell>
                <TableCell className="text-right">{stats.avgAssists}</TableCell>
                <TableCell className="text-right">{stats.kdSpread}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};