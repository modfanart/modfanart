import { config } from '../config';
import { logger } from '../logger';
import { getFeatureFlag } from '../edge-config';
import { withRetry, isRetryableError } from './grok-retry';

// Types
export type GrokAiRequest = {
  prompt: string;
  imageUrl?: string;
  maxTokens?: number;
  temperature?: number;
};

export type GrokAiResponse = {
  id: string;
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

/**
 * Call GrokAi API with retry logic
 */
export async function callGrokAi(request: GrokAiRequest): Promise<GrokAiResponse> {
  try {
    // Check if GrokAi integration is enabled
    const isEnabled = await getFeatureFlag('enableGrokIntegration');
    if (!isEnabled) {
      throw new Error('GrokAi integration is disabled');
    }

    logger.info('Calling GrokAi API', {
      context: 'grok-ai',
      promptLength: request.prompt.length,
      hasImage: !!request.imageUrl,
    });

    // Use retry logic for the API call
    return await withRetry(
      async () => {
        const response = await fetch(`${config.grokAi.baseUrl}/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.grokAi.apiKey}`,
          },
          body: JSON.stringify({
            model: 'grok-1',
            prompt: request.prompt,
            image_url: request.imageUrl,
            max_tokens: request.maxTokens || 1000,
            temperature: request.temperature || 0.7,
          }),
          signal: AbortSignal.timeout(config.grokAi.timeout),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(`GrokAi API error: ${response.status} ${errorText}`);
          (error as any).status = response.status;
          throw error;
        }

        const data = await response.json();

        return {
          id: data.id,
          text: data.choices[0].text,
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          },
        };
      },
      {
        maxRetries: 3,
        initialDelay: 500,
        maxDelay: 5000,
      }
    );
  } catch (error) {
    logger.error('Error calling GrokAi API', error, { context: 'grok-ai' });

    // Check if we should retry based on the error
    if (isRetryableError(error)) {
      logger.info('Retryable error encountered, already handled by retry logic', {
        context: 'grok-ai',
      });
    }

    throw new Error(`GrokAi API error: ${(error as Error).message}`);
  }
}

/**
 * Analyze submission content using GrokAi
 */
export async function analyzeSubmissionContent(params: {
  title: string;
  description: string;
  category: string;
  originalIp: string;
  imageUrl: string;
}): Promise<{
  isAppropriate: boolean;
  confidenceScore: number;
  reasoning: string;
  suggestedTags: string[];
}> {
  try {
    const { title, description, category, originalIp, imageUrl } = params;

    // Create a prompt for GrokAi
    const prompt = `
      Analyze this fan art submission:
      
      Title: ${title}
      Description: ${description}
      Category: ${category}
      Original IP: ${originalIp}
      
      Please determine:
      1. Is this content appropriate and compliant with IP guidelines?
      2. What is your confidence level in this assessment (0-100)?
      3. Provide reasoning for your decision.
      4. Suggest 3-5 relevant tags for this content.
      
      Format your response as JSON:
      {
        "isAppropriate": boolean,
        "confidenceScore": number,
        "reasoning": "string",
        "suggestedTags": ["tag1", "tag2", ...]
      }
    `;

    const response = await callGrokAi({
      prompt,
      imageUrl,
      temperature: 0.3, // Lower temperature for more consistent results
    });

    // Parse the JSON response
    try {
      // Extract JSON from the response text
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        isAppropriate: analysis.isAppropriate,
        confidenceScore: analysis.confidenceScore,
        reasoning: analysis.reasoning,
        suggestedTags: analysis.suggestedTags,
      };
    } catch (parseError) {
      logger.error('Error parsing GrokAi response', parseError, {
        context: 'grok-ai',
        data: {
          responseText: response.text,
        },
      });

      // Return a fallback response
      return {
        isAppropriate: false,
        confidenceScore: 0,
        reasoning: 'Failed to parse AI response',
        suggestedTags: [],
      };
    }
  } catch (error) {
    logger.error('Error analyzing submission with GrokAi', error, { context: 'grok-ai' });

    // Return a fallback response
    return {
      isAppropriate: false,
      confidenceScore: 0,
      reasoning: `AI analysis failed: ${(error as Error).message}`,
      suggestedTags: [],
    };
  }
}

/**
 * Generate image tags using GrokAi
 */
export async function generateImageTags(imageUrl: string, category: string): Promise<string[]> {
  try {
    const prompt = `
      Generate 5-10 relevant tags for this ${category} fan art image.
      Return only a JSON array of tags, nothing else.
      Example: ["character", "style", "mood", "colors", "theme"]
    `;

    const response = await callGrokAi({
      prompt,
      imageUrl,
      temperature: 0.3,
    });

    // Parse the JSON response
    try {
      // Extract JSON array from the response text
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const tags = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(tags)) {
        throw new Error('Response is not an array');
      }

      return tags.slice(0, 10); // Limit to 10 tags
    } catch (parseError) {
      logger.error('Error parsing GrokAi tags response', parseError, {
        context: 'grok-ai',
        data: {
          responseText: response.text,
        },
      });

      // Return default tags based on category
      return getDefaultTags(category);
    }
  } catch (error) {
    logger.error('Error generating image tags with GrokAi', error, { context: 'grok-ai' });

    // Return default tags based on category
    return getDefaultTags(category);
  }
}

/**
 * Get default tags based on category
 */
function getDefaultTags(category: string): string[] {
  const defaultTags: Record<string, string[]> = {
    anime: ['anime', 'manga', 'character', 'illustration', 'fanart'],
    gaming: ['game', 'character', 'videogame', 'fanart', 'digital'],
    movies: ['movie', 'character', 'film', 'fanart', 'cinema'],
    comics: ['comic', 'superhero', 'character', 'illustration', 'fanart'],
    other: ['fanart', 'character', 'illustration', 'digital', 'creative'],
  };

  return defaultTags[category.toLowerCase()] ?? defaultTags['other']!;
}
