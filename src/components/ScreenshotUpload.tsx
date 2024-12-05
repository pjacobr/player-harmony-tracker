import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";

interface ScreenshotUploadProps {
  onScoresDetected: (scores: { id: string; kills: number; deaths: number; assists: number }[]) => void;
  players: Player[];
}

export const ScreenshotUpload = ({ onScoresDetected, players }: ScreenshotUploadProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      console.log('Starting file upload...');

      // Create a unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `screenshot-${timestamp}.${fileExt}`;

      // Upload to Supabase Storage with explicit content type
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(uploadData.path);

      console.log('Public URL generated:', publicUrl);

      // Analyze with GPT-4 Vision
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-screenshot', {
          body: { imageUrl: publicUrl },
        });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError;
      }

      console.log('Analysis completed:', analysisData);

      // Parse the response and match with existing players
      const parsedScores = JSON.parse(analysisData.result);
      const matchedScores = Object.entries(parsedScores).map(([name, scores]: [string, any]) => {
        const player = players.find(p => 
          p.name.toLowerCase() === name.toLowerCase() ||
          name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (player) {
          return {
            id: player.id,
            kills: scores.kills || 0,
            deaths: scores.deaths || 0,
            assists: scores.assists || 0,
          };
        }
        return null;
      }).filter(Boolean);

      onScoresDetected(matchedScores);
      toast({
        title: "Success",
        description: "Screenshot analyzed successfully",
      });
    } catch (error) {
      console.error('Error processing screenshot:', error);
      toast({
        title: "Error",
        description: "Failed to analyze screenshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-4 bg-gaming-card">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload Screenshot</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a screenshot to automatically detect scores
        </p>
        <div className="flex justify-center">
          <Button
            disabled={isAnalyzing}
            className="relative"
            variant="outline"
          >
            {isAnalyzing ? "Analyzing..." : "Upload Screenshot"}
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept="image/*"
              disabled={isAnalyzing}
            />
          </Button>
        </div>
      </div>
    </Card>
  );
};