import { useMemo, useState, useRef } from "react";
import { Player } from "@/types/player";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { Card } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";
import { ConnectionControls } from "./player-connections/ConnectionControls";
import { FilterMetric } from "./player-connections/types";
import { createGraphData, getNodeColor, getLinkColor } from "./player-connections/graphUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerConnectionsChartProps {
  players: Player[];
  gameStats: any[];
}

export const PlayerConnectionsChart = ({ players, gameStats }: PlayerConnectionsChartProps) => {
  const { width } = useWindowSize();
  const isMobile = useIsMobile();
  const graphWidth = isMobile ? width - 32 : Math.min(width - 32, 800);
  const graphHeight = isMobile ? 300 : Math.min(500, graphWidth * 0.75);
  
  const [selectedMetric, setSelectedMetric] = useState<FilterMetric>('winRate');
  const [minValue, setMinValue] = useState(0);
  const [graphZoom, setGraphZoom] = useState(1);
  const graphRef = useRef<ForceGraphMethods>();

  const metricRanges = {
    winRate: { min: 0, max: 1, step: 0.1, format: (v: number) => `${(v * 100).toFixed(0)}%` },
    gamesPlayed: { min: 0, max: 50, step: 1, format: (v: number) => v.toString() },
    avgKDA: { min: 0, max: 10, step: 0.5, format: (v: number) => v.toFixed(1) }
  };

  const graphData = useMemo(
    () => createGraphData(players, gameStats, selectedMetric, minValue),
    [players, gameStats, selectedMetric, minValue]
  );

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

  return (
    <Card className="p-4">
      <ConnectionControls
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        minValue={minValue}
        setMinValue={setMinValue}
        onZoom={handleZoom}
        onResetZoom={resetZoom}
        metricRanges={metricRanges}
      />

      <div className="relative dark:bg-background" style={{ height: graphHeight }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={(node) => getNodeColor(node, graphData.links)}
          linkColor={(link) => getLinkColor(link, selectedMetric, metricRanges)}
          linkWidth={(link: any) => (link.gamesPlayed as number) / 2}
          nodeRelSize={isMobile ? 6 : 8}
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
    </Card>
  );
};