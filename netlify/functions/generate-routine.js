exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { productData } = JSON.parse(event.body);
    
    // Validate input
    if (!productData || !Array.isArray(productData) || productData.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid product data provided' })
      };
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    const messages = [
      {
        role: "system",
        content: "You are a professional beauty and skincare expert. Create personalized beauty routines based on the products provided. Format your response using bullet points (•) and numbered lists (1., 2., 3.) instead of markdown symbols like # or *. Use clear, simple formatting that's easy to read in a web browser."
      },
      {
        role: "user",
        content: `Please create a personalized beauty routine using these products: ${JSON.stringify(productData, null, 2)}. 

Please format your response with:
• Bullet points for lists and tips
• Numbers (1., 2., 3.) for step-by-step instructions
• Clear section breaks with simple text headings
• NO markdown symbols like # or *

Include:
• Morning routine (if applicable)
• Evening routine (if applicable) 
• Application order and timing
• Important tips or precautions
• How often to use each product

Make it comprehensive but easy to follow with clear formatting.`
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        routine: data.choices[0].message.content 
      })
    };

  } catch (error) {
    console.error('Error in generate-routine function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: `Failed to generate routine: ${error.message}` 
      })
    };
  }
};