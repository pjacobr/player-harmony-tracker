import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
            content: `You are an expert at analyzing Halo game screenshots. The screenshots follow a specific format:

1. Top left corner shows the winning team/player and game mode (either "Team Slayer" or "Slayer")
2. Below that is a table with columns in this exact order:
   - Players (player names)
   - Score (total score)
   - Kills (number of kills)
   - Assists (number of assists)
   - Deaths (number of deaths)

For team games:
- Players are grouped by their team
- Team scores are shown at the top
- The winning team is clearly indicated

Extract data ONLY for these specific players: ${playerNames.join(', ')}. Try to match player names even if they have slight variations in capitalization or special characters.

Return ONLY a JSON object with no markdown formatting in this format:
{
  "gameMode": "Slayer|Team Slayer",
  "winningTeam": number|null,
  "scores": {
    "playerName": {
      "kills": number,
      "deaths": number,
      "assists": number,
      "team": number|null
    }
  }
}

Notes:
- winningTeam should be null for non-team games (regular Slayer)
- team should be null for non-team games
- Only include data for the specified player names
- Ensure all numbers are integers
- If a player's stats cannot be found, exclude them from the response`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the game mode, K/D/A scores, team information, and winning team for these specific players: ${playerNames.join(', ')}. Return only JSON, no markdown.`
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
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    // Clean up the response by removing any markdown formatting
    let result = data.choices[0].message.content;
    // Remove markdown code block syntax if present
    result = result.replace(/```json\n|\n```/g, '');
    
    console.log('Cleaned result:', result);

    // Validate that the result is valid JSON
    try {
      JSON.parse(result);
    } catch (e) {
      console.error('Invalid JSON in result:', result);
      throw new Error('OpenAI returned invalid JSON format');
    }

    return new Response(
      JSON.stringify({ result }),
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