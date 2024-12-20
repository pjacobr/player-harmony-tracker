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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing Halo game screenshots. Extract data from the scoreboard by columns.

First, determine if this is a team game or individual game (Slayer).
Then, extract data from EACH COLUMN separately, maintaining the exact order from top to bottom.

Return a JSON object with this EXACT structure:
{
  "gameMode": "Slayer|Team Slayer",
  "winningTeam": number|null,
  "columns": {
    "names": string[],    // Player names from top to bottom
    "scores": number[],   // Total scores from top to bottom
    "kills": number[],    // Kills from top to bottom
    "assists": number[],  // Assists from top to bottom
    "deaths": number[]    // Deaths from top to bottom
  },
  "teams": number[]|null  // Team numbers (1 or 2) from top to bottom, null array for Slayer
}

Important notes:
- Extract each column's data in order from top to bottom
- All arrays must have the same length
- Ensure numbers are integers
- Double check column order: Names, Scores, Kills, Assists, Deaths
- For team games, include team numbers; for Slayer, use null array
- winningTeam should be null for non-team games`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the scoreboard data column by column, maintaining the order from top to bottom. Remember the column order is: Names, Scores, Kills, Assists, Deaths.`
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
    
    // Match extracted data with known player names
    const matchedScores: Record<string, any> = {};
    const { columns } = parsedData;

    // Zip the columns together and match with known players
    columns.names.forEach((name: string, index: number) => {
      const matchedName = playerNames.find(knownName => 
        knownName.toLowerCase() === name.toLowerCase() ||
        knownName.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(knownName.toLowerCase())
      );

      if (matchedName) {
        matchedScores[matchedName] = {
          score: columns.scores[index],
          kills: columns.kills[index],
          assists: columns.assists[index],
          deaths: columns.deaths[index],
          team: parsedData.teams ? parsedData.teams[index] : null
        };
      }
    });

    const finalResult = {
      gameMode: parsedData.gameMode,
      winningTeam: parsedData.winningTeam,
      scores: matchedScores
    };

    console.log('Matched scores:', finalResult);

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