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
            content: `You are an expert at analyzing game screenshots. Extract the kills, deaths, and assists for the following players: ${playerNames.join(', ')}. Return ONLY a JSON object with no markdown formatting in this exact format: {"playerName": {"kills": number, "deaths": number, "assists": number}}. Try to match player names even if they're slightly different (e.g., with different capitalization or special characters).`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the K/D/A scores for these specific players: ${playerNames.join(', ')}. Return only JSON, no markdown.`
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