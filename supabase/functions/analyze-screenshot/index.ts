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
      // Try to parse the result as JSON
      const parsedResult = JSON.parse(result);
      console.log('Successfully parsed result:', parsedResult);
      
      return new Response(
        JSON.stringify({ result: JSON.stringify(parsedResult) }),
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