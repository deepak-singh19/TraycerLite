import OpenAI from 'openai';
import { createHash } from 'crypto';
import { Phase, OpenAIEnhancementResponse, CacheEntry, TaskAnalysis } from './types.js';

export class OpenAIEnhancementService {
  private client: OpenAI | null = null;
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CONCURRENCY = 3;
  private activeRequests = 0;
  private requestQueue: Array<() => Promise<void>> = [];

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async enhancePhase(
    phase: Phase,
    task: string,
    analysis: TaskAnalysis,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<OpenAIEnhancementResponse> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const {
      model = 'gpt-4',
      maxTokens = 600, // Reduced since we're asking for concise responses
      temperature = 0.1, // Lower for more consistent JSON
    } = options;

    // LLM enhancement started

    // Generate cache key
    const cacheKey = this.generateCacheKey(task, phase.name, phase.files);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      // Cache hit - returning cached response
      return cached.response;
    }

    // Wait for available slot
    await this.waitForSlot();

    try {
      this.activeRequests++;
      const response = await this.performEnhancement(phase, task, analysis, {
        model,
        maxTokens,
        temperature,
      });

      // Cache the response
      this.cache.set(cacheKey, {
        response,
        timestamp: Date.now(),
        ttl: this.TTL,
      });

      return response;
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  private async waitForSlot(): Promise<void> {
    if (this.activeRequests < this.MAX_CONCURRENCY) {
      return;
    }

    return new Promise((resolve) => {
      this.requestQueue.push(async () => {
        resolve();
      });
    });
  }

  private processQueue(): void {
    if (this.requestQueue.length > 0 && this.activeRequests < this.MAX_CONCURRENCY) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  private async performEnhancement(
    phase: Phase,
    task: string,
    analysis: TaskAnalysis,
    options: {
      model: string;
      maxTokens: number;
      temperature: number;
    }
  ): Promise<OpenAIEnhancementResponse> {
    const prompt = this.buildEnhancementPrompt(phase, task, analysis, false);
    
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const startTime = Date.now();
        
        const response = await this.client!.chat.completions.create({
          model: options.model,
          messages: [
            {
              role: 'system',
              content: 'You are a senior software architect. Given the task and a single phase, produce a JSON object ONLY, strictly matching the schema supplied. Do not output any prose outside the JSON. If you cannot follow the schema, return an error object with field \'error\' and a helpful message. Your response must be valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1, // Lower temperature for more consistent JSON
          max_tokens: options.maxTokens,
        });

        const endTime = Date.now();

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }
        
        // Process the LLM response

        // Try to extract JSON from the response
        let jsonContent = content.trim();
        
        // Remove any markdown code blocks
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Remove any leading text before JSON
        const jsonStart = jsonContent.indexOf('{');
        if (jsonStart > 0) {
          jsonContent = jsonContent.substring(jsonStart);
        }
        
        // Check if JSON is complete (ends with })
        if (!jsonContent.endsWith('}')) {
          throw new Error('JSON response appears to be truncated');
        }
        
        // Validate that we have valid JSON structure
        if (!jsonContent.startsWith('{') || !jsonContent.endsWith('}')) {
          throw new Error('Response does not contain valid JSON object');
        }
        
        const parsed = JSON.parse(jsonContent);
        
        // Validate response
        if (this.validateResponse(parsed)) {
          return parsed;
        } else {
          throw new Error('Invalid response schema');
        }
      } catch (error) {
        attempts++;
        console.error(`Enhancement attempt ${attempts} failed:`, error);

        if (attempts >= maxAttempts) {
          // All attempts failed - trying simple schema as fallback
          if (attempts === maxAttempts) {
            try {
              const simplePrompt = this.buildEnhancementPrompt(phase, task, analysis, true);
              const simpleResponse = await this.client!.chat.completions.create({
                model: options.model,
                messages: [
                  {
                    role: 'system',
                    content: 'You are a JSON generator. Return ONLY valid JSON. Start with { and end with }.',
                  },
                  {
                    role: 'user',
                    content: simplePrompt,
                  },
                ],
                temperature: 0.1,
                max_tokens: 400,
              });
              
              const simpleContent = simpleResponse.choices[0]?.message?.content;
              if (simpleContent) {
                let simpleJson = simpleContent.trim();
                const jsonStart = simpleJson.indexOf('{');
                if (jsonStart > 0) {
                  simpleJson = simpleJson.substring(jsonStart);
                }
                const jsonMatch = simpleJson.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  simpleJson = jsonMatch[0];
                }
                simpleJson = this.cleanJsonString(simpleJson);
                
                if (simpleJson.startsWith('{') && simpleJson.endsWith('}')) {
                  const simpleParsed = JSON.parse(simpleJson);
                  return this.convertSimpleToFullResponse(simpleParsed, phase);
                }
              }
            } catch (simpleError) {
              // Simple schema also failed - will use fallback response
            }
          }
          
          // Return a fallback response
          return this.createFallbackResponse(phase);
        }

        // Try repair on the last attempt
        if (attempts === maxAttempts - 1) {
          try {
            const repairResponse = await this.client!.chat.completions.create({
              model: options.model,
              messages: [
            {
              role: 'system',
              content: 'You are a JSON generator. Your ONLY job is to return valid JSON that matches the provided schema. Do NOT include any text, explanations, or markdown. Start your response with { and end with }. Return ONLY the JSON object.',
            },
                {
                  role: 'user',
                  content: `The previous JSON response had syntax errors. Please return ONLY valid JSON with proper formatting:
- Use double quotes for all strings
- No trailing commas
- No extra text or explanations
- Proper array and object syntax
- Escape special characters in strings

Previous error: ${error instanceof Error ? error.message : String(error)}

Return the corrected JSON response:`,
                },
              ],
              temperature: 0.1,
              max_tokens: options.maxTokens,
            });

            const repairContent = repairResponse.choices[0]?.message?.content;
            if (repairContent) {
              // Try to extract JSON from the repair response
              let repairJsonContent = repairContent.trim();
              const repairJsonMatch = repairContent.match(/\{[\s\S]*\}/);
              if (repairJsonMatch) {
                repairJsonContent = repairJsonMatch[0];
              }
              
              const repairParsed = JSON.parse(repairJsonContent);
              
              if (this.validateResponse(repairParsed)) {
                return repairParsed;
              }
            }
          } catch (repairError) {
            console.error('Repair attempt failed:', repairError);
          }
        }
      }
    }

    return this.createFallbackResponse(phase);
  }

  private buildEnhancementPrompt(
    phase: Phase,
    task: string,
    analysis: TaskAnalysis,
    useSimpleSchema: boolean = false
  ): string {
    const filesList = phase.files
      .map(f => `- ${f.path} (${f.action}): ${f.description}`)
      .join('\n');

    const phaseDetail = phase.files
      .map(f => `${f.path}:\n${f.details.map(d => `  - ${d}`).join('\n')}`)
      .join('\n\n');

    const prompt = `
Task: ${task}
Project Type: ${analysis.projectType}
Phase name: ${phase.name}
Files: ${filesList}
Phase detail: ${phaseDetail}

PROVIDE CONCISE BUT DETAILED ARCHITECTURAL GUIDANCE:

Keep responses under 800 words but include:
1. Key architecture patterns (2-3 most important)
2. Critical design decisions with brief reasoning
3. Essential security measures
4. Key performance optimizations
5. Scalability approach (1-2 sentences)
6. Error handling strategy (1-2 sentences)
7. Testing approach (1-2 sentences)
8. Deployment considerations (1-2 sentences)

Be specific but concise:
- Use 2-3 design patterns maximum
- 2-3 security measures maximum
- 2-3 performance optimizations maximum
- Keep file details to 2-3 bullet points each
- Use short, actionable sentences

CRITICAL: Return ONLY valid JSON. No extra text, no explanations, no markdown formatting.

${useSimpleSchema ? `
Return JSON exactly matching this SIMPLE schema:
{
  "description": "string",
  "reasoning": "string",
  "files": [
    {
      "path": "string",
      "details": ["string", "string"]
    }
  ]
}` : `
Return JSON exactly matching this CONCISE schema:
{
  "description": "Brief 1-2 sentence description",
  "reasoning": "Brief 1-2 sentence reasoning", 
  "architecture": {
    "patterns": ["Pattern1", "Pattern2"],
    "design_decisions": ["Decision1", "Decision2"],
    "scalability_approach": "Brief scalability strategy",
    "security_measures": ["Security1", "Security2"],
    "performance_optimizations": ["Optimization1", "Optimization2"]
  },
  "implementation": {
    "best_practices": ["Practice1", "Practice2"],
    "code_structure": "Brief structure description",
    "error_handling": "Brief error handling approach", 
    "testing_strategy": "Brief testing approach",
    "deployment_considerations": "Brief deployment notes"
  },
  "files": [
    {
      "path": "file/path",
      "details": ["Detail1", "Detail2"],
      "architecture_notes": "Brief architectural note",
      "implementation_guidance": "Brief implementation note",
      "security_considerations": "Brief security note",
      "performance_tips": "Brief performance note"
    }
  ]
}`}

IMPORTANT RULES:
- Use double quotes for all strings
- No trailing commas
- No comments in JSON
- Escape special characters properly
- Keep arrays simple with 2-3 items max
    `.trim();

    return prompt;
  }

  private validateResponse(response: any): response is OpenAIEnhancementResponse {
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Validate basic fields
    if (typeof response.description !== 'string' || typeof response.reasoning !== 'string') {
      return false;
    }

    // Validate architecture object
    if (!response.architecture || typeof response.architecture !== 'object') {
      return false;
    }
    const arch = response.architecture;
    if (!Array.isArray(arch.patterns) || !Array.isArray(arch.design_decisions) || 
        !Array.isArray(arch.security_measures) || !Array.isArray(arch.performance_optimizations) ||
        typeof arch.scalability_approach !== 'string') {
      return false;
    }

    // Validate implementation object
    if (!response.implementation || typeof response.implementation !== 'object') {
      return false;
    }
    const impl = response.implementation;
    if (!Array.isArray(impl.best_practices) || typeof impl.code_structure !== 'string' ||
        typeof impl.error_handling !== 'string' || typeof impl.testing_strategy !== 'string' ||
        typeof impl.deployment_considerations !== 'string') {
      return false;
    }

    // Validate files array
    if (!Array.isArray(response.files)) {
      return false;
    }

    for (const file of response.files) {
      if (typeof file.path !== 'string' || !Array.isArray(file.details) ||
          typeof file.architecture_notes !== 'string' || typeof file.implementation_guidance !== 'string' ||
          typeof file.security_considerations !== 'string' || typeof file.performance_tips !== 'string') {
        return false;
      }
      for (const detail of file.details) {
        if (typeof detail !== 'string') {
          return false;
        }
      }
    }

    if (response.estimated_tokens !== undefined && typeof response.estimated_tokens !== 'number') {
      return false;
    }

    return true;
  }

  private createFallbackResponse(phase: Phase): OpenAIEnhancementResponse {
    return {
      description: `Enhanced implementation details for ${phase.name}. This phase focuses on ${phase.description.toLowerCase()}.`,
      reasoning: 'This is a fallback response generated when AI enhancement failed. The base plan remains intact and functional.',
      architecture: {
        patterns: ['MVC Pattern', 'Repository Pattern'],
        design_decisions: ['Modular architecture for maintainability', 'Separation of concerns'],
        scalability_approach: 'Horizontal scaling with load balancing',
        security_measures: ['Input validation', 'Authentication and authorization'],
        performance_optimizations: ['Caching strategies', 'Database indexing']
      },
      implementation: {
        best_practices: ['Follow SOLID principles', 'Use TypeScript for type safety', 'Implement proper error handling'],
        code_structure: 'Organize code into modules with clear separation of concerns',
        error_handling: 'Implement comprehensive error handling with proper logging',
        testing_strategy: 'Unit tests, integration tests, and end-to-end testing',
        deployment_considerations: 'Containerization with Docker, CI/CD pipeline setup'
      },
      files: phase.files.map(file => ({
        path: file.path,
        details: [
          ...file.details,
          'Additional implementation considerations will be added during development',
          'Follow best practices for the specific technology stack',
        ],
        architecture_notes: 'Follow established architectural patterns for this file type',
        implementation_guidance: 'Implement with focus on maintainability and scalability',
        security_considerations: 'Ensure proper input validation and security measures',
        performance_tips: 'Optimize for performance and consider caching where appropriate'
      })),
    };
  }

  private convertSimpleToFullResponse(simpleResponse: any, phase: Phase): OpenAIEnhancementResponse {
    return {
      description: simpleResponse.description || `Enhanced implementation for ${phase.name}`,
      reasoning: simpleResponse.reasoning || 'AI-enhanced implementation with best practices',
      architecture: {
        patterns: ['MVC Pattern', 'Repository Pattern'],
        design_decisions: ['Modular architecture', 'Separation of concerns'],
        scalability_approach: 'Horizontal scaling with load balancing',
        security_measures: ['Input validation', 'Authentication'],
        performance_optimizations: ['Caching', 'Database indexing']
      },
      implementation: {
        best_practices: ['Follow SOLID principles', 'Use TypeScript'],
        code_structure: 'Organize code into modules',
        error_handling: 'Comprehensive error handling with logging',
        testing_strategy: 'Unit and integration testing',
        deployment_considerations: 'Containerization with Docker'
      },
      files: (simpleResponse.files || []).map((file: any) => ({
        path: file.path,
        details: file.details || [],
        architecture_notes: 'Follow established patterns',
        implementation_guidance: 'Implement with best practices',
        security_considerations: 'Ensure proper validation',
        performance_tips: 'Optimize for performance'
      }))
    };
  }

  private cleanJsonString(jsonString: string): string {
    // Remove trailing commas before closing braces/brackets
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix single quotes to double quotes (but be careful not to break existing JSON)
    jsonString = jsonString.replace(/([{,]\s*)'([^']*)'(\s*[,:])/g, '$1"$2"$3');
    
    // Remove any comments (though they shouldn't be there)
    jsonString = jsonString.replace(/\/\/.*$/gm, '');
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Ensure proper array formatting
    jsonString = jsonString.replace(/\[\s*\]/g, '[]');
    
    return jsonString;
  }

  private generateCacheKey(task: string, phaseName: string, files: Phase['files']): string {
    const normalizedTask = task.toLowerCase().trim();
    const filePaths = files.map(f => f.path).sort().join(',');
    const input = `${normalizedTask}|${phaseName}|${filePaths}`;
    return createHash('sha256').update(input).digest('hex');
  }

  // Test API key validity
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Test connection. Respond with "OK".',
          },
        ],
        max_tokens: 10,
      });
      return true;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
    };
  }
}
