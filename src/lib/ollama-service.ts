/**
 * Ollama Integration for Syntara Tenders AI
 * 
 * Ollama is a free, open-source alternative to cloud AI services.
 * It runs AI models locally on your machine - no API keys needed!
 * 
 * Setup:
 * 1. Download Ollama: https://ollama.com/download
 * 2. Install and run: ollama pull llama3.1:8b
 * 3. Set OLLAMA_ENABLED=true in .env.local
 * 4. Restart your server
 * 
 * Models available:
 * - llama3.1:8b (fastest, good quality)
 * - llama3.1:70b (slower, excellent quality)
 * - mistral:7b (alternative)
 * - codellama:13b (for code analysis)
 */

class OllamaService {
  private baseUrl: string;
  private model: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    this.enabled = process.env.OLLAMA_ENABLED === 'true';
    
    if (this.enabled) {
      this.checkConnection();
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        console.log(`✅ Ollama connected! Available models: ${models.length}`);
        
        // Check if our preferred model is available
        const hasModel = models.some((m: any) => m.name.includes(this.model.split(':')[0]));
        if (!hasModel) {
          console.warn(`⚠️  Model ${this.model} not found. Run: ollama pull ${this.model}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Ollama not available. Install from: https://ollama.com/download`);
      this.enabled = false;
    }
  }

  /**
   * Generate a response using Ollama
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const fullPrompt = systemPrompt 
        ? `System: ${systemPrompt}\n\nUser: ${prompt}` 
        : prompt;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        console.log(`✅ Ollama (${this.model}) generated response`);
        return data.response;
      }

      return null;
    } catch (error) {
      console.error('Ollama generation error:', error);
      return null;
    }
  }

  /**
   * Generate a chat response with conversation context
   */
  async chat(messages: Array<{ role: string; content: string }>): Promise<string | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.message && data.message.content) {
        console.log(`✅ Ollama (${this.model}) chat response`);
        return data.message.content;
      }

      return null;
    } catch (error) {
      console.error('Ollama chat error:', error);
      return null;
    }
  }

  /**
   * Extract text embeddings for semantic search
   */
  async getEmbeddings(text: string): Promise<number[] | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.embedding || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if Ollama is available and enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the current model name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * List all available models
   */
  async listModels(): Promise<string[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models.map((m: any) => m.name);
      }
    } catch (error) {
      console.error('Failed to list models:', error);
    }
    
    return [];
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();

