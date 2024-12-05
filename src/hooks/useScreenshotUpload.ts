import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";
import { findBestMatchingPlayer } from "@/utils/playerMatching";
import heic2any from "heic2any";

interface UseScreenshotUploadProps {
  players: Player[];
  onScoresDetected: (scores: { id: string; kills: number; deaths: number; assists: number }[]) => void;
}

export const useScreenshotUpload = ({ players, onScoresDetected }: UseScreenshotUploadProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string>("");

  const convertHeicToJpg = async (file: File): Promise<File> => {
    if (file.type === "image/heic" || file.name.toLowerCase().endsWith('.heic')) {
      console.log('Converting HEIC to JPEG...');
      try {
        const jpgBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8
        });
        
        // Convert the blob or blob array to a single blob
        const finalBlob = Array.isArray(jpgBlob) ? jpgBlob[0] : jpgBlob;
        
        // Create a new file with .jpg extension
        const fileName = file.name.replace(/\.heic$/i, '.jpg');
        return new File([finalBlob], fileName, { type: 'image/jpeg' });
      } catch (error) {
        console.error('Error converting HEIC to JPEG:', error);
        throw new Error('Failed to convert HEIC image to JPEG');
      }
    }
    return file;
  };

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

      // Convert HEIC to JPG if necessary
      const processedFile = await convertHeicToJpg(file);
      console.log('File processed:', processedFile.name, processedFile.type);

      const timestamp = Date.now();
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `screenshot-${timestamp}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, processedFile, {
          contentType: processedFile.type,
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

      const parsedData = JSON.parse(analysisData.result);
      console.log('Parsed data:', parsedData);
      
      const gameMode = parsedData.gameMode || 'Slayer'; // Default to Slayer if not detected
      const parsedScores = parsedData.scores || parsedData; // Handle both new and old response formats
      
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
              team: scores.team || null, // Add team information
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
        map_id: selectedMap,
        game_mode: gameMode,
        team_number: score.team // Add team number to the insert
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