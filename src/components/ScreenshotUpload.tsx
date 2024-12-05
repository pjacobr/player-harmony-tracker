import { Card } from "@/components/ui/card";
import { Player } from "@/types/player";
import { useScreenshotUpload } from "@/hooks/useScreenshotUpload";
import { UploadButton } from "./UploadButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ScreenshotUploadProps {
  onScoresDetected: (scores: { id: string; kills: number; deaths: number; assists: number }[]) => void;
  players: Player[];
}

export const ScreenshotUpload = ({ onScoresDetected, players }: ScreenshotUploadProps) => {
  const { isAnalyzing, handleFileUpload, selectedMap, setSelectedMap } = useScreenshotUpload({
    players,
    onScoresDetected
  });

  const { data: maps = [] } = useQuery({
    queryKey: ['maps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maps')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-4 bg-gaming-card">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload Screenshot</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a screenshot to automatically detect scores
        </p>
        <div className="space-y-4">
          <div className="max-w-xs mx-auto">
            <Select value={selectedMap} onValueChange={setSelectedMap}>
              <SelectTrigger>
                <SelectValue placeholder="Select map" />
              </SelectTrigger>
              <SelectContent>
                {maps.map((map) => (
                  <SelectItem key={map.id} value={map.id}>
                    {map.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center">
            <UploadButton
              isAnalyzing={isAnalyzing}
              onFileSelect={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};