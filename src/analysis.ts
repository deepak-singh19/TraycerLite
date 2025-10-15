import { TaskAnalysis } from './types.js';
import { DecisionEngine } from './decisionEngine.js';

// Pattern detection for project types and features
const PATTERNS = {
  projectType: {
    'web-app': ['app', 'website', 'dashboard', 'platform', 'portal', 'web app', 'webapp'],
    'api': ['api', 'rest', 'endpoint', 'service', 'backend', 'server'],
    'cli': ['command', 'terminal', 'cli', 'tool', 'script', 'command line'],
    'library': ['library', 'package', 'module', 'sdk', 'framework'],
    'fullstack': ['full', 'fullstack', 'full-stack', 'complete', 'full stack'],
  },
  
  features: {
    auth: ['auth', 'login', 'signup', 'user', 'account', 'register', 'authentication', 'authorization'],
    database: ['database', 'data', 'store', 'persist', 'sql', 'postgres', 'mysql', 'mongodb', 'db'],
    realtime: ['realtime', 'websocket', 'live', 'socket', 'real-time', 'real time', 'live updates'],
    api: ['rest api', 'rest endpoint', 'backend api', 'server api', 'api endpoint', 'graphql', 'routes', 'express', 'fastify', 'backend', 'node', 'nodejs', 'server'],
    fastapi: ['fastapi', 'fast api', 'python api', 'python backend', 'uvicorn'],
    frontend: ['frontend', 'ui', 'interface', 'react', 'component', 'vue', 'angular', 'context api', 'state management'],
    testing: ['test', 'testing', 'jest', 'unit test', 'integration test', 'e2e'],
    payment: ['payment', 'stripe', 'checkout', 'billing', 'paypal', 'credit card'],
    email: ['email', 'mail', 'notification', 'smtp', 'sendgrid'],
    file: ['file', 'upload', 'download', 'storage', 's3', 'cloudinary'],
    search: ['search', 'elasticsearch', 'algolia', 'query'],
    cache: ['cache', 'redis', 'memcached', 'caching'],
    monitoring: ['monitoring', 'analytics', 'logging', 'metrics', 'tracking'],
    fintech: ['fintech', 'financial', 'banking', 'loan', 'credit', 'mortgage', 'investment', 'trading', 'crypto', 'blockchain', 'payment processing', 'compliance', 'audit', 'transaction'],
    healthcare: ['healthcare', 'medical', 'patient', 'hospital', 'clinic', 'pharmacy', 'hipaa', 'health records'],
    ecommerce: ['ecommerce', 'e-commerce', 'shopping', 'retail', 'inventory', 'catalog', 'cart', 'checkout'],
  }
};

// Analyze task input and extract key information
export function analyzeTask(input: string): TaskAnalysis {
  const lowerInput = input.toLowerCase();
  
  // Detect project type
  const projectType = detectProjectType(lowerInput);
  
  // Detect features
  const features = detectFeatures(lowerInput);
  
  // Determine complexity
  const complexity = determineComplexity(features.length);
  
  const baseAnalysis = {
    projectType,
    features,
    complexity,
    hasAuth: features.includes('auth'),
    hasDatabase: features.includes('database') || features.includes('auth') || projectType === 'web-app' || projectType === 'fullstack',
    hasFrontend: features.includes('frontend') || projectType === 'web-app' || projectType === 'fullstack',
    hasBackend: features.includes('api') || features.includes('fastapi') || features.includes('auth') || projectType === 'api' || projectType === 'fullstack' || features.includes('fintech') || features.includes('ecommerce') || input.includes('backend') || (projectType === 'web-app' && (features.includes('database') || input.includes('blog') || input.includes('posts') || input.includes('comments'))),
    hasRealtime: features.includes('realtime'),
    hasFastAPI: features.includes('fastapi'),
    hasFintech: features.includes('fintech'),
    hasHealthcare: features.includes('healthcare'),
    hasEcommerce: features.includes('ecommerce'),
  };

  // Generate technology recommendations
  const decisionEngine = new DecisionEngine();
  
  const analysis: TaskAnalysis = {
    ...baseAnalysis,
  };

  // Add database recommendation if database is needed
  if (analysis.hasDatabase) {
    analysis.databaseRecommendation = decisionEngine.analyzeDatabase(analysis);
  }

  // Add backend recommendation if backend is needed
  if (analysis.hasBackend) {
    analysis.backendRecommendation = decisionEngine.analyzeBackend(analysis);
  }

  // Add frontend recommendation if frontend is needed
  if (analysis.hasFrontend) {
    analysis.frontendRecommendation = decisionEngine.analyzeFrontend(analysis);
  }

  return analysis;
}

function detectProjectType(input: string): 'web-app' | 'api' | 'cli' | 'library' | 'fullstack' {
  // Check for full-stack patterns first
  if ((input.includes('frontend') && input.includes('backend')) || 
      (input.includes('react') && input.includes('node')) ||
      (input.includes('frontend') && input.includes('node')) ||
      input.includes('fullstack') || input.includes('full-stack') || input.includes('full stack')) {
    return 'fullstack';
  }
  
  // Check for specific patterns to avoid false positives
  if (input.includes('context api') || input.includes('react') || input.includes('component')) {
    return 'web-app';
  }
  
  // Check for library first (before CLI to avoid "tool" matching)
  if (input.includes('library') || input.includes('package') || input.includes('module') || input.includes('sdk') || input.includes('framework')) {
    return 'library';
  }
  
  for (const [type, keywords] of Object.entries(PATTERNS.projectType)) {
    if (keywords.some(keyword => {
      // For API, be more specific to avoid matching "context api"
      if (type === 'api' && keyword === 'api') {
        return input.includes('rest api') || input.includes('backend api') || input.includes('server api') || input.includes('rest endpoint');
      }
      return input.includes(keyword);
    })) {
      return type as 'web-app' | 'api' | 'cli' | 'library' | 'fullstack';
    }
  }
  return 'web-app'; // Default
}

function detectFeatures(input: string): string[] {
  const detectedFeatures: string[] = [];
  
  // Check for specific frontend patterns first to avoid conflicts
  if (input.includes('context api') || input.includes('state management')) {
    detectedFeatures.push('frontend');
  }
  
  for (const [feature, keywords] of Object.entries(PATTERNS.features)) {
    // Skip if already detected as frontend for context api
    if (feature === 'api' && detectedFeatures.includes('frontend') && input.includes('context api')) {
      continue;
    }
    
    // Use more specific matching to avoid false positives
    const hasFeature = keywords.some(keyword => {
      // For multi-word keywords, check for exact phrase
      if (keyword.includes(' ')) {
        return input.includes(keyword);
      }
      // For single words, check if it's not part of a larger word
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(input);
    });
    
    if (hasFeature && !detectedFeatures.includes(feature)) {
      detectedFeatures.push(feature);
    }
  }
  
  // Special handling for API detection - check for REST API patterns
  if (input.includes('rest api') || input.includes('rest endpoint') || input.includes('backend api') || input.includes('server api')) {
    if (!detectedFeatures.includes('api')) {
      detectedFeatures.push('api');
    }
  }
  
  return detectedFeatures;
}

function determineComplexity(featureCount: number): 'simple' | 'medium' | 'complex' {
  if (featureCount <= 2) return 'simple';
  if (featureCount <= 5) return 'medium';
  return 'complex';
}
