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
    console.log('Processing image URL:', imageUrl);
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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a specialized Halo scoreboard analyzer. Extract player scores from the image and return them in a specific JSON format.

Instructions:
1. Identify the game mode (Team Slayer or Slayer)
2. For team games, identify the winning team (1 or 2)
3. Extract player names and their scores
4. Return data in this exact format:

{
  "gameMode": "Team Slayer",
  "winningTeam": 1,
  "scores": {
    "PlayerName1": {
      "kills": 10,
      "deaths": 5,
      "assists": 2,
      "score": 1250,
      "team": 1
    },
    "PlayerName2": {
      "kills": 8,
      "deaths": 7,
      "assists": 3,
      "score": 1050,
      "team": 2
    }
  }
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this Halo scoreboard image and extract the scores in the specified JSON format. Match these player names: ' + playerNames.join(', ')
              },
              {
                type: 'image_url',
                image_url: {
                  url: cleanUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }

    let result = data.choices[0].message.content;
    console.log('Raw extracted data:', result);

    try {
      // Clean up the response by removing any markdown code blocks
      result = result.replace(/```json\n|\n```|```/g, '');
      
      // Try to parse the result as JSON
      const parsedResult = JSON.parse(result);
      console.log('Successfully parsed result:', parsedResult);

      // Validate the structure of the parsed result
      if (!parsedResult.gameMode || !parsedResult.scores) {
        throw new Error('Invalid score data structure');
      }

      // Match the extracted player names with the provided names
      const matchedScores: Record<string, any> = {};
      Object.entries(parsedResult.scores).forEach(([extractedName, scoreData]) => {
        const matchedName = playerNames.find(name => 
          name.toLowerCase().trim() === extractedName.toLowerCase().trim() ||
          name.toLowerCase().includes(extractedName.toLowerCase()) ||
          extractedName.toLowerCase().includes(name.toLowerCase())
        );

        if (matchedName) {
          matchedScores[matchedName] = scoreData;
        }
      });

      const finalResult = {
        gameMode: parsedResult.gameMode,
        winningTeam: parsedResult.winningTeam,
        scores: matchedScores
      };

      return new Response(
        JSON.stringify({ result: JSON.stringify(finalResult) }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      console.log('Failed to parse content:', result);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    console.error('Error in analyze-screenshot function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Invalid response from OpenAI API',
        details: error.message || 'Failed to analyze screenshot'
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