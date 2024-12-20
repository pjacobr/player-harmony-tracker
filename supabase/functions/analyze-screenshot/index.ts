import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, playerNames } = await req.json();
    console.log('Received image URL:', imageUrl);
    console.log('Player names to match:', playerNames);

    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    // Clean and validate the URL
    const cleanUrl = new URL(imageUrl).toString();
    console.log('Cleaned URL:', cleanUrl);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are a specialized Halo scoreboard analyzer. Extract data from each column separately, maintaining strict top-to-bottom order.

Instructions:
1. For each column, start at the top and work down
2. Record each value in exact order
3. Use null for any unclear or missing values
4. Keep arrays aligned - same length for all columns

Return data in this format:
{
  "gameMode": "Team Slayer" or "Slayer",
  "winningTeam": number or null,
  "data": {
    "names": string[],     // Player names in order
    "scores": number[],    // Scores in same order
    "kills": number[],     // Kills in same order
    "assists": number[],   // Assists in same order
    "deaths": number[],    // Deaths in same order
    "teams": number[]      // Team numbers in same order (or null array for Slayer)
  }
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract data from this scoreboard image. Process each column separately, maintaining strict top-to-bottom order.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: cleanUrl
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    let result = data.choices[0].message.content;
    result = result.replace(/```json\n|\n```/g, '');
    
    console.log('Raw extracted data:', result);

    // Parse the extracted data
    const parsedData = JSON.parse(result);
    console.log('Parsed data:', parsedData);
    
    // Match extracted data with known player names
    const matchedScores: Record<string, any> = {};
    const { data: columns } = parsedData;

    // Enhanced name matching with logging
    columns.names.forEach((extractedName: string, index: number) => {
      console.log(`Processing extracted name: "${extractedName}"`);
      
      if (!extractedName) {
        console.log('Skipping empty name');
        return;
      }

      const normalizedExtractedName = extractedName.toLowerCase().trim();
      
      // Find the best matching player name
      const matchedName = playerNames.find(knownName => {
        const normalizedKnownName = knownName.toLowerCase().trim();
        return normalizedKnownName === normalizedExtractedName ||
               normalizedKnownName.includes(normalizedExtractedName) ||
               normalizedExtractedName.includes(normalizedKnownName);
      });

      if (matchedName) {
        console.log(`Matched "${extractedName}" to "${matchedName}"`);
        matchedScores[matchedName] = {
          score: columns.scores[index] ?? 0,
          kills: columns.kills[index] ?? 0,
          assists: columns.assists[index] ?? 0,
          deaths: columns.deaths[index] ?? 0,
          team: columns.teams ? columns.teams[index] : null
        };
      } else {
        console.log(`No match found for "${extractedName}"`);
      }
    });

    const finalResult = {
      gameMode: parsedData.gameMode,
      winningTeam: parsedData.winningTeam,
      scores: matchedScores
    };

    console.log('Final matched scores:', finalResult);

    return new Response(
      JSON.stringify({ result: JSON.stringify(finalResult) }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-screenshot function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to analyze screenshot'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});