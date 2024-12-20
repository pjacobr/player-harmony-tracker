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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a specialized Halo scoreboard analyzer. Your task is to extract data from a Halo game scoreboard image with extreme precision.

Follow these steps exactly:

1. First, identify if this is a Team game (look for team indicators) or Slayer (no teams).

2. For each column, working left to right:
   - Column 1: Player Names (leftmost)
   - Column 2: Total Score
   - Column 3: Kills (K)
   - Column 4: Assists (A)
   - Column 5: Deaths (D)

3. For each column:
   - Start at the very top row
   - Move down row by row
   - Record each value in order
   - Use null for any missing or unclear values
   - Ensure you maintain the exact same order for all columns

4. For team games:
   - Note which team (1 or 2) each player is on
   - Identify the winning team (team with highest total score)

Return a JSON object with this exact structure:
{
  "gameMode": "Team Slayer" or "Slayer",
  "winningTeam": number or null,
  "data": {
    "names": string[],     // Names in exact order from top to bottom
    "scores": (number|null)[],  // Scores in same order
    "kills": (number|null)[],   // Kills in same order
    "assists": (number|null)[], // Assists in same order
    "deaths": (number|null)[],  // Deaths in same order
    "teams": (number|null)[]    // Team numbers (1 or 2) in same order, or null array for Slayer
  }
}

CRITICAL:
- All arrays MUST have the same length
- Maintain exact top-to-bottom order across all arrays
- Use null for any unclear or missing values
- Double-check that values are from correct columns
- Verify team assignments if present`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this scoreboard image. Extract each column's data separately, maintaining strict top-to-bottom order. Remember: Names, Scores, Kills, Assists, Deaths.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
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
        
        // Try different matching strategies
        const exactMatch = normalizedKnownName === normalizedExtractedName;
        const containsMatch = normalizedKnownName.includes(normalizedExtractedName) || 
                            normalizedExtractedName.includes(normalizedKnownName);
        
        console.log(`Comparing with "${knownName}":`, {
          exactMatch,
          containsMatch
        });
        
        return exactMatch || containsMatch;
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