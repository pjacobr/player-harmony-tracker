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
            content: `You are an expert at analyzing Halo game screenshots. You will extract data from the scoreboard in a structured way.

First, determine if this is a team game or individual game (Slayer).
Then, extract ALL player data from the scoreboard in order from top to bottom.

For each row in the scoreboard, extract these values IN ORDER:
1. Player Name (leftmost)
2. Score
3. Kills
4. Assists
5. Deaths (rightmost)

Return a JSON object with this EXACT structure:
{
  "gameMode": "Slayer|Team Slayer",
  "winningTeam": number|null,
  "playerData": [
    {
      "name": "string",
      "score": number,
      "kills": number,
      "assists": number,
      "deaths": number,
      "team": number|null
    }
  ]
}

Important notes:
- Extract ALL players in order from top to bottom
- Include team numbers (1 or 2) for team games, null for Slayer
- winningTeam should be null for non-team games
- Ensure all numbers are integers
- Pay special attention to the order of columns: Name, Score, Kills, Assists, Deaths
- Double check you're reading numbers from the correct columns`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract ALL player data from this scoreboard in order from top to bottom. Remember the column order is: Name, Score, Kills, Assists, Deaths.`
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
    const knownPlayers = new Set(playerNames.map((name: string) => name.toLowerCase()));

    parsedData.playerData.forEach((player: any) => {
      const playerName = player.name;
      const matchedName = playerNames.find(name => 
        name.toLowerCase() === playerName.toLowerCase() ||
        name.toLowerCase().includes(playerName.toLowerCase()) ||
        playerName.toLowerCase().includes(name.toLowerCase())
      );

      if (matchedName) {
        matchedScores[matchedName] = {
          score: player.score,
          kills: player.kills,
          assists: player.assists,
          deaths: player.deaths,
          team: player.team
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