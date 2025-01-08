import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";
import { convertHeicToJpg } from "@/utils/fileConversion";
import { processScores, prepareGameScoreRows } from "@/utils/scoreProcessing";
import { useSupabaseStorage } from "./useSupabaseStorage";

interface UseScreenshotUploadProps {
  players: Player[];
  onScoresDetected: (scores: { id: string; kills: number; deaths: number; assists: number }[]) => void;
}

export const useScreenshotUpload = ({ players, onScoresDetected }: UseScreenshotUploadProps) => {
  const { toast } = useToast();
  const { uploadScreenshot } = useSupabaseStorage();
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

      const processedFile = await convertHeicToJpg(file);
      console.log('File processed:', processedFile.name, processedFile.type);

      const publicUrl = await uploadScreenshot(processedFile);

      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-screenshot', {
          body: { 
            imageUrl: publicUrl,
            playerNames: players.map(p => p.name)
          },
        });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError;
      }

      console.log('Analysis completed:', analysisData);

      const parsedData = JSON.parse(analysisData.result);
      console.log('Parsed data:', parsedData);
      
      const gameMode = parsedData.gameMode || 'Slayer';
      const winningTeam = parsedData.winningTeam;
      const parsedScores = parsedData.scores || parsedData;
      
      const matchedScores = processScores(parsedScores, players, winningTeam);

      if (matchedScores.length === 0) {
        throw new Error('No valid scores were detected from the screenshot');
      }

      const gameId = crypto.randomUUID();
      console.log('Generated game ID:', gameId);

      // First, create the game record
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          id: gameId,
          game_mode: gameMode,
          map_id: selectedMap,
          screenshot_url: publicUrl
        })
        .select()
        .single();

      if (gameError) {
        console.error('Error creating game:', gameError);
        throw gameError;
      }

      // Then, prepare and insert the game scores
      const gameScores = matchedScores.map(score => ({
        game_id: gameId,
        player_id: score.id,
        kills: score.kills,
        deaths: score.deaths,
        assists: score.assists,
        score: score.score || score.kills,
        team_number: score.team || null,
        won: score.team === winningTeam
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('game_scores')
        .insert(gameScores)
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