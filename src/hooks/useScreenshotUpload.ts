import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";
import { findBestMatchingPlayer } from "@/utils/playerMatching";

interface UseScreenshotUploadProps {
  players: Player[];
  onScoresDetected: (scores: { id: string; kills: number; deaths: number; assists: number }[]) => void;
}

export const useScreenshotUpload = ({ players, onScoresDetected }: UseScreenshotUploadProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsAnalyzing(true);
      console.log('Starting file upload...');

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `screenshot-${timestamp}.${fileExt}`;

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

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(uploadData.path);

      console.log('Public URL generated:', publicUrl);

      const playerNames = players.map(p => p.name);
      console.log('Sending player names to match:', playerNames);

      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-screenshot', {
          body: { 
            imageUrl: publicUrl,
            playerNames: playerNames
          },
        });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError;
      }

      console.log('Analysis completed:', analysisData);

      const parsedScores = JSON.parse(analysisData.result);
      console.log('Parsed scores:', parsedScores);
      
      const matchedScores = Object.entries(parsedScores)
        .map(([name, scores]: [string, any]) => {
          const player = findBestMatchingPlayer(name, players);
          console.log(`Matching "${name}" with players:`, player?.name || 'No match found');
          
          if (player) {
            return {
              id: player.id,
              kills: scores.kills || 0,
              deaths: scores.deaths || 0,
              assists: scores.assists || 0,
            };
          }
          return null;
        })
        .filter(Boolean);

      console.log('Matched scores:', matchedScores);
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

  return {
    isAnalyzing,
    handleFileUpload
  };
};