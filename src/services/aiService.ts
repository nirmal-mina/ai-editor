/**
 * AI Service for generating contextual content continuations using Google Gemini API.
 * 
 * This production implementation integrates with Google's Gemini AI for intelligent text generation:
 * - Real-time text continuation using Gemini 2.0 Flash model
 * - Context-aware generation with customizable parameters
 * - Comprehensive error handling with retry logic
 * - Rate limiting and quota management
 * - Statistical analysis utilities
 * 
 * Configuration:
 * - Set VITE_GEMINI_API_KEY in your .env file
 * - Get your API key from: https://makersuite.google.com/app/apikey
 */

import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

/**
 * Configuration interface for Gemini AI generation
 */
interface GeminiConfig {
  temperature: number;           // Randomness: 0.0 (deterministic) to 2.0 (very creative)
  topK: number;                  // Top K sampling: limits vocabulary to K most likely tokens
  topP: number;                  // Nucleus sampling: cumulative probability threshold
  maxOutputTokens: number;       // Maximum length of generated text
  candidateCount: number;        // Number of response variations to generate
}

/**
 * Text statistics interface for document analysis
 */
interface TextStatistics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  averageWordLength: number;
  averageSentenceLength: number;
}

/**
 * Error types for better error handling
 */
const AIServiceError = {
  API_KEY_MISSING: 'API_KEY_MISSING',
  NETWORK_ERROR: 'NETWORK_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  CONTENT_FILTERED: 'CONTENT_FILTERED',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN: 'UNKNOWN',
} as const;

type AIServiceErrorType = typeof AIServiceError[keyof typeof AIServiceError];

/**
 * Custom error class for AI service errors
 */
class AIGenerationError extends Error {
  readonly type: AIServiceErrorType;
  readonly originalError?: unknown;

  constructor(
    type: AIServiceErrorType,
    message: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AIGenerationError';
    this.type = type;
    this.originalError = originalError;
  }
}

export class AIService {
  private apiKey: string;
  private readonly modelName = 'gemini-2.0-flash';
  
  /**
   * Default configuration optimized for text continuation
   * - Temperature 0.7: Balanced creativity and coherence
   * - TopK 40: Diverse vocabulary while maintaining quality
   * - TopP 0.95: High quality output filtering
   * - Max 500 tokens: Substantial continuation without overwhelming
   */
  private readonly defaultConfig: GeminiConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 500,
    candidateCount: 1,
  };

  /**
   * Safety settings to allow creative content while blocking harmful material
   */
  private readonly safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  /**
   * Retry configuration for handling transient failures
   */
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly RETRY_BACKOFF_MULTIPLIER = 2;

  /**
   * Rate limiting to prevent API quota exhaustion
   */
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL_MS = 500; // Minimum 500ms between requests

  constructor() {
    // Retrieve API key from environment variables
    this.apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

    console.log('🔑 API Key loaded:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT FOUND');
    console.log('🔑 Full env check:', import.meta.env.VITE_GEMINI_API_KEY);

    if (this.apiKey && this.apiKey !== 'your_api_key_here') {
      console.log('✅ Gemini API key loaded');
    } else {
      console.warn('⚠️ Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file');
    }
  }

  /**
   * Generates a continuation of the provided text using Gemini AI.
   * 
   * Features:
   * - Intelligent context analysis and continuation
   * - Automatic retry on transient failures
   * - Rate limiting to prevent quota exhaustion
   * - Comprehensive error handling
   * 
   * @param currentText - The existing text to continue from
   * @param config - Optional custom configuration for generation
   * @returns Promise resolving to the complete text (original + continuation)
   * @throws AIGenerationError with specific error type for proper handling
   */
  async generateContinuation(
    currentText: string,
    config?: Partial<GeminiConfig>
  ): Promise<string> {
    // Validate API key configuration
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      throw new AIGenerationError(
        AIServiceError.API_KEY_MISSING,
        'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.\n' +
        'Get your API key from: https://makersuite.google.com/app/apikey'
      );
    }

    // Enforce rate limiting
    await this.enforceRateLimit();

    // Merge custom config with defaults
    const generationConfig = { ...this.defaultConfig, ...config };

    // Prepare the prompt for continuation
    const prompt = this.buildContinuationPrompt(currentText);

    // Attempt generation with retry logic
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔵 Generation attempt ${attempt}/${this.MAX_RETRIES}`);
        const continuation = await this.generateWithGemini(prompt, generationConfig);
        console.log('✅ Generation successful!');
        return this.formatContinuation(currentText, continuation);
      } catch (error) {
        console.error(`🔴 Attempt ${attempt} failed:`, error);
        lastError = error;
        
        // Don't retry on certain error types
        if (error instanceof AIGenerationError) {
          if (
            error.type === AIServiceError.API_KEY_MISSING ||
            error.type === AIServiceError.CONTENT_FILTERED ||
            error.type === AIServiceError.QUOTA_EXCEEDED
          ) {
            throw error;
          }
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY_MS * Math.pow(this.RETRY_BACKOFF_MULTIPLIER, attempt - 1);
          console.warn(`Retry attempt ${attempt}/${this.MAX_RETRIES} after ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw new AIGenerationError(
      AIServiceError.NETWORK_ERROR,
      `Failed to generate continuation after ${this.MAX_RETRIES} attempts. Please check your connection and try again.`,
      lastError
    );
  }

  /**
   * Builds an optimized prompt for text continuation
   */
  private buildContinuationPrompt(currentText: string): string {
    // Extract the last portion for context (max 2000 characters to stay within limits)
    const contextWindow = 2000;
    const context = currentText.length > contextWindow
      ? '...' + currentText.slice(-contextWindow)
      : currentText;

    const prompt = `Continue writing the following text naturally and coherently. Maintain the same style, tone, and subject matter. Provide 2-3 sentences that flow seamlessly from the existing content.

Text to continue:
${context}

Continuation:`;

    console.log('🔵 Built prompt with context length:', context.length);
    return prompt;
  }

  /**
   * Calls Gemini API with proper error handling using REST API
   */
  private async generateWithGemini(
    prompt: string,
    config: GeminiConfig
  ): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      throw new AIGenerationError(
        AIServiceError.API_KEY_MISSING,
        'Gemini API key not configured. Please check your .env file.'
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens,
      },
      safetySettings: this.safetySettings,
    };

    try {
      console.log('🔵 Calling Gemini REST API...');
      console.log('🔵 URL:', url.replace(this.apiKey, 'API_KEY'));
      console.log('🔵 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔵 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 API Error Response:', errorData);
        
        if (response.status === 400) {
          throw new AIGenerationError(
            AIServiceError.INVALID_RESPONSE,
            `Invalid request: ${errorData.error?.message || 'Unknown error'}`,
          );
        } else if (response.status === 403 || response.status === 401) {
          throw new AIGenerationError(
            AIServiceError.API_KEY_MISSING,
            'Invalid API key. Please check your VITE_GEMINI_API_KEY.',
          );
        } else if (response.status === 429) {
          throw new AIGenerationError(
            AIServiceError.RATE_LIMIT,
            'Rate limit exceeded. Please wait and try again.',
          );
        } else {
          throw new AIGenerationError(
            AIServiceError.NETWORK_ERROR,
            `API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
          );
        }
      }

      const data = await response.json();
      console.log('🔵 Response data:', data);

      // Check for safety blocks
      if (data.promptFeedback?.blockReason) {
        console.error('🔴 Content blocked:', data.promptFeedback.blockReason);
        throw new AIGenerationError(
          AIServiceError.CONTENT_FILTERED,
          `Content blocked: ${data.promptFeedback.blockReason}`,
        );
      }

      // Extract text from response
      const candidate = data.candidates?.[0];
      if (!candidate) {
        throw new AIGenerationError(
          AIServiceError.INVALID_RESPONSE,
          'No candidates in response',
        );
      }

      const text = candidate.content?.parts?.[0]?.text;
      if (!text || text.trim().length === 0) {
        throw new AIGenerationError(
          AIServiceError.INVALID_RESPONSE,
          'Empty response from API',
        );
      }

      console.log('✅ Successfully generated text:', text.substring(0, 100) + '...');
      return text.trim();

    } catch (error: unknown) {
      if (error instanceof AIGenerationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('🔴 Fetch Error:', errorMessage);
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        throw new AIGenerationError(
          AIServiceError.NETWORK_ERROR,
          'Network error. Check your internet connection.',
          error
        );
      }

      throw new AIGenerationError(
        AIServiceError.UNKNOWN,
        `Unexpected error: ${errorMessage}`,
        error
      );
    }
  }

  /**
   * Formats the continuation by combining with original text
   */
  private formatContinuation(originalText: string, continuation: string): string {
    // Remove any prompt artifacts that might appear in the response
    let cleanedContinuation = continuation;
    
    // Remove common prompt remnants
    const promptIndicators = ['Continuation:', 'Continue:', 'Here is the continuation:'];
    for (const indicator of promptIndicators) {
      if (cleanedContinuation.startsWith(indicator)) {
        cleanedContinuation = cleanedContinuation.slice(indicator.length).trim();
      }
    }

    // Ensure proper spacing
    const needsSpace = originalText.length > 0 && !originalText.endsWith(' ') && !originalText.endsWith('\n');
    const hasLeadingSpace = cleanedContinuation.startsWith(' ');
    
    if (needsSpace && !hasLeadingSpace) {
      return originalText + ' ' + cleanedContinuation;
    }
    
    return originalText + cleanedContinuation;
  }

  /**
   * Enforces rate limiting to prevent API quota exhaustion
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL_MS) {
      const waitTime = this.MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
      await this.sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Promise-based sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Analyzes text and returns comprehensive statistics.
   * 
   * Provides detailed metrics for:
   * - Word and character counts
   * - Sentence and paragraph analysis
   * - Reading time estimation
   * - Average word and sentence length
   * 
   * @param text - The text to analyze
   * @returns Object containing various text metrics
   */
  getTextStats(text: string): TextStatistics {
    // Word analysis
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    // Character counts
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    // Sentence detection (simple but effective for most prose)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Paragraph detection
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;
    
    // Reading time calculation (average adult reads 200-250 WPM)
    // Using 200 WPM as conservative estimate
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    // Additional metrics
    const averageWordLength = wordCount > 0
      ? charactersNoSpaces / wordCount
      : 0;
      
    const averageSentenceLength = sentenceCount > 0
      ? wordCount / sentenceCount
      : 0;

    return {
      words: wordCount,
      characters,
      charactersNoSpaces,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      readingTime: readingTimeMinutes,
      averageWordLength: Math.round(averageWordLength * 10) / 10,
      averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    };
  }

  /**
   * Checks if the service is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_api_key_here');
  }

  /**
   * Gets the current configuration status message
   */
  getConfigurationStatus(): string {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      return 'API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.';
    }
    
    return 'Gemini AI configured and ready.';
  }
}

// Export error types for external error handling
export { AIServiceError, AIGenerationError };

// Singleton instance for app-wide use
export const aiService = new AIService();

