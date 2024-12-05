import { Card } from "@/components/ui/card";
import { Player } from "@/types/player";
import { useScreenshotUpload } from "@/hooks/useScreenshotUpload";
import { UploadButton } from "./UploadButton";

interface ScreenshotUploadProps {
  onScoresDetected: (scores: { id: string; kills: number; deaths: number; assists: number }[]) => void;
  players: Player[];
}

export const ScreenshotUpload = ({ onScoresDetected, players }: ScreenshotUploadProps) => {
  const { isAnalyzing, handleFileUpload } = useScreenshotUpload({
    players,
    onScoresDetected
  });

  return (
    <Card className="p-4 bg-gaming-card">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload Screenshot</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a screenshot to automatically detect scores
        </p>
        <div className="flex justify-center">
          <UploadButton
            isAnalyzing={isAnalyzing}
            onFileSelect={handleFileUpload}
          />
        </div>
      </div>
    </Card>
  );
};