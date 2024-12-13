import { useMemo, useState, useRef } from "react";
import { Player } from "@/types/player";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { calculateTeamPerformance } from "@/utils/playerStats";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Minimize2 } from "lucide-react";
import { useWindowSize } from "@/hooks/use-window-size";

interface PlayerConnectionsChartProps {
  players: Player[];
  gameStats: any[];
}

type FilterMetric = 'winRate' | 'gamesPlayed' | 'avgKDA';

export const PlayerConnectionsChart = ({ players, gameStats }: PlayerConnectionsChartProps) => {
  const { width } = useWindowSize();
  const graphWidth = Math.min(width - 32, 800);
  const graphHeight = Math.min(500, graphWidth * 0.75);
  
  const [selectedMetric, setSelectedMetric] = useState<FilterMetric>('winRate');
  const [minValue, setMinValue] = useState(0);
  const [graphZoom, setGraphZoom] = useState(1);
  const graphRef = useRef<ForceGraphMethods>();

  const metricRanges = {
    winRate: { min: 0, max: 1, step: 0.1, format: (v: number) => `${(v * 100).toFixed(0)}%` },
    gamesPlayed: { min: 0, max: 50, step: 1, format: (v: number) => v.toString() },
    avgKDA: { min: 0, max: 10, step: 0.5, format: (v: number) => v.toFixed(1) }
  };

  const graphData = useMemo(() => {
    const nodes = players.map(player => ({
      id: player.id,
      name: player.name,
    }));

    const links = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const performance = calculateTeamPerformance(
          gameStats,
          players[i].id,
          players[j].id
        );
        
        if (performance.gamesPlayed > 0) {
          const metrics = {
            winRate: performance.winRate,
            gamesPlayed: performance.gamesPlayed,
            avgKDA: performance.avgKDA
          };

          if (metrics[selectedMetric] >= minValue) {
            links.push({
              source: players[i].id,
              target: players[j].id,
              ...metrics
            });
          }
        }
      }
    }

    return { nodes, links };
  }, [players, gameStats, selectedMetric, minValue]);

  const handleZoom = (zoomIn: boolean) => {
    if (graphRef.current) {
      const newZoom = zoomIn ? graphZoom * 1.2 : graphZoom * 0.8;
      setGraphZoom(newZoom);
      graphRef.current.zoom(newZoom);
    }
  };

  const resetZoom = () => {
    if (graphRef.current) {
      setGraphZoom(1);
      graphRef.current.zoom(1);
      graphRef.current.centerAt(0, 0);
    }
  };

  const getNodeColor = (node: any) => {
    const links = graphData.links.filter(
      (link: any) => link.source.id === node.id || link.target.id === node.id
    );
    return links.length > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))";
  };

  const getLinkColor = (link: any) => {
    const value = link[selectedMetric];
    const { min, max } = metricRanges[selectedMetric];
    const normalizedValue = (value - min) / (max - min);
    
    if (normalizedValue >= 0.7) return "hsl(var(--success))";
    if (normalizedValue >= 0.4) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Player Connections</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleZoom(true)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleZoom(false)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetZoom}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-48">
            <Select value={selectedMetric} onValueChange={(value: FilterMetric) => setSelectedMetric(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="winRate">Win Rate</SelectItem>
                <SelectItem value="gamesPlayed">Games Played</SelectItem>
                <SelectItem value="avgKDA">Average KDA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 flex items-center gap-4">
            <span className="text-sm">Min: {metricRanges[selectedMetric].format(minValue)}</span>
            <Slider
              value={[minValue]}
              min={metricRanges[selectedMetric].min}
              max={metricRanges[selectedMetric].max}
              step={metricRanges[selectedMetric].step}
              onValueChange={([value]) => setMinValue(value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="relative" style={{ height: graphHeight }}>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={getNodeColor}
            linkColor={getLinkColor}
            linkWidth={(link: any) => (link.gamesPlayed as number) / 2}
            nodeRelSize={8}
            linkLabel={(link: any) => {
              const l = link as any;
              return `Games: ${l.gamesPlayed} | Win Rate: ${(l.winRate * 100).toFixed(1)}% | Avg KDA: ${l.avgKDA.toFixed(2)}`;
            }}
            backgroundColor="transparent"
            width={graphWidth}
            height={graphHeight}
            d3VelocityDecay={0.3}
            d3AlphaDecay={0.02}
            cooldownTicks={100}
            onEngineStop={() => {
              if (graphRef.current && graphZoom !== 1) {
                graphRef.current.zoom(graphZoom);
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};
