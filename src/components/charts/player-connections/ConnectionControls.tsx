import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Minimize2 } from "lucide-react";
import { FilterMetric, MetricRanges } from "./types";

interface ConnectionControlsProps {
  selectedMetric: FilterMetric;
  setSelectedMetric: (metric: FilterMetric) => void;
  minValue: number;
  setMinValue: (value: number) => void;
  onZoom: (zoomIn: boolean) => void;
  onResetZoom: () => void;
  metricRanges: MetricRanges;
}

export const ConnectionControls = ({
  selectedMetric,
  setSelectedMetric,
  minValue,
  setMinValue,
  onZoom,
  onResetZoom,
  metricRanges,
}: ConnectionControlsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Player Connections</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onZoom(true)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onZoom(false)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onResetZoom}>
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
    </div>
  );
};