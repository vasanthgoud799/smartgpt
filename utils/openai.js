// utils/perplexity.js
import "dotenv/config";

const getPerplexityAPIResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  };

  try {
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      options
    );

    // If the response is not OK (e.g., status 401, 429, 500)
    if (!response.ok) {
      // Read the body as text first, as it may not be JSON
      const errorText = await response.text();
      let errorMessage = `Perplexity API Error: ${response.status}`;

      // Try to parse as JSON to get a more specific message from the API
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = `Perplexity API Error: ${errorJson.error.message}`;
        }
      } catch (e) {
        // If it's not JSON, include the raw text in the error message
        errorMessage += ` - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Key Fix 1: Access the first element of the 'choices' array
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      // Handle cases where the API gives a 200 OK but an empty/invalid response
      throw new Error("Invalid response structure from Perplexity API.");
    }
  } catch (err) {
    console.error("Error in getPerplexityAPIResponse:", err); // Log the error for debugging
    // Key Fix 2: Re-throw the error so the calling function can handle it
    throw err;
  }
};

export default getPerplexityAPIResponse;
