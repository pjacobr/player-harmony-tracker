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
  const [selectedMap, setSelectedMap] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!selectedMap) {
      toast({
        title: "Error",
        description: "Please select a map before uploading a screenshot",
        variant: "destructive",
      });
      return;
    }

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
      
      // Filter out null scores and match players
      const matchedScores = Object.entries(parsedScores)
        .filter(([_, scores]) => scores !== null) // Filter out null scores
        .map(([name, scores]: [string, any]) => {
          const player = findBestMatchingPlayer(name, players);
          console.log(`Matching "${name}" with players:`, player?.name || 'No match found');
          
          if (player && scores) { // Double check that we have both player and scores
            return {
              id: player.id,
              kills: scores.kills || 0,
              deaths: scores.deaths || 0,
              assists: scores.assists || 0,
            };
          }
          return null;
        })
        .filter(Boolean); // Remove any null entries

      console.log('Matched scores:', matchedScores);

      if (matchedScores.length === 0) {
        throw new Error('No valid scores were detected from the screenshot');
      }

      // Generate a unique game ID for this set of scores
      const gameId = crypto.randomUUID();
      console.log('Generated game ID:', gameId);

      // Prepare the rows to insert
      const rowsToInsert = matchedScores.map(score => ({
        game_id: gameId,
        player_id: score.id,
        kills: score.kills,
        deaths: score.deaths,
        assists: score.assists,
        map_id: selectedMap
      }));

      console.log('Preparing to insert rows:', rowsToInsert);

      // Save all scores to the game_scores table
      const { data: insertedData, error: insertError } = await supabase
        .from('game_scores')
        .insert(rowsToInsert)
        .select();

      if (insertError) {
        console.error('Error saving scores:', insertError);
        throw insertError;
      }

      console.log('Scores saved successfully:', insertedData);
      onScoresDetected(matchedScores);
      
      toast({
        title: "Success",
        description: "Screenshot analyzed and scores saved successfully",
      });
    } catch (error) {
      console.error('Error processing screenshot:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze screenshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    handleFileUpload,
    selectedMap,
    setSelectedMap
  };
};