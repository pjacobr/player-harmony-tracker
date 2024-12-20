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
            content: `You are an expert at analyzing Halo game screenshots. The screenshots show a scoreboard with data in this EXACT order from left to right:

1. Player Names (leftmost column)
2. Score (total score for the player)
3. Kills
4. Assists
5. Deaths (rightmost column)

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
      "score": number,
      "kills": number,
      "assists": number,
      "deaths": number,
      "team": number|null
    }
  }
}

Notes:
- winningTeam should be null for non-team games (regular Slayer)
- team should be null for non-team games
- Only include data for the specified player names
- Ensure all numbers are integers
- If a player's stats cannot be found, exclude them from the response
- Pay special attention to the order of columns: Name, Score, Kills, Assists, Deaths
- The score column is separate from kills and should be included in the output
- Double check that you're reading the numbers from the correct columns based on this order`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the game mode, scores, and stats for these specific players: ${playerNames.join(', ')}. Remember the column order is: Name, Score, Kills, Assists, Deaths. Return only JSON, no markdown.`
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

    let result = data.choices[0].message.content;
    result = result.replace(/```json\n|\n```/g, '');
    
    console.log('Cleaned result:', result);

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