import { TaskAnalysis, TechnologyComparison } from './types.js';

// Database decision rules
const DATABASE_RULES = {
  sql: {
    triggers: ['structured', 'relationships', 'acid', 'transactions', 'consistency'],
    score: (analysis: TaskAnalysis) => {
      let score = 0;
      if (analysis.features.includes('auth')) score += 0.3;
      if (analysis.features.includes('payment')) score += 0.4;
      if (analysis.complexity === 'complex') score += 0.3;
      if (analysis.hasAuth) score += 0.2;
      
      // Domain-specific scoring
      if (analysis.hasFintech) score += 0.8; // Fintech requires ACID compliance
      if (analysis.hasHealthcare) score += 0.7; // Healthcare requires data integrity
      if (analysis.hasEcommerce) score += 0.5; // E-commerce benefits from ACID
      
      return Math.min(score, 1.0);
    },
    recommendation: 'PostgreSQL',
    reasoning: [
      'Structured data with clear relationships',
      'ACID compliance for critical operations',
      'Complex queries with joins and aggregations',
      'Mature ecosystem with proven reliability'
    ],
    pros: [
      'ACID compliance',
      'Complex queries with joins',
      'Mature ecosystem',
      'Excellent tooling',
      'Strong consistency'
    ],
    cons: [
      'Schema changes require migrations',
      'Primarily vertical scaling',
      'Less flexible for rapid changes'
    ],
    alternatives: [
      {
        technology: 'MySQL',
        whenToUse: 'When you need a more established, widely-used SQL database',
        tradeoffs: ['More mature ecosystem', 'Better Windows support', 'Less advanced features than PostgreSQL']
      },
      {
        technology: 'SQLite',
        whenToUse: 'For small applications or development/testing',
        tradeoffs: ['Zero configuration', 'Single file database', 'Not suitable for production with multiple users']
      }
    ]
  },
  nosql: {
    triggers: ['unstructured', 'scalable', 'flexible', 'big data', 'document'],
    score: (analysis: TaskAnalysis) => {
      let score = 0;
      if (analysis.features.includes('realtime')) score += 0.3;
      if (analysis.features.includes('analytics')) score += 0.4;
      if (analysis.complexity === 'simple') score += 0.3;
      if (analysis.hasRealtime) score += 0.2;
      
      // Domain-specific penalties
      if (analysis.hasFintech) score -= 0.6; // Fintech should avoid NoSQL for financial data
      if (analysis.hasHealthcare) score -= 0.5; // Healthcare needs structured data
      
      return Math.max(0, Math.min(score, 1.0));
    },
    recommendation: 'MongoDB',
    reasoning: [
      'Flexible schema for rapid development',
      'Horizontal scaling capabilities',
      'Good for document-based data',
      'JSON-like data structure'
    ],
    pros: [
      'Flexible schema',
      'Horizontal scaling',
      'Fast development',
      'JSON-like data',
      'Good for prototyping'
    ],
    cons: [
      'No ACID transactions',
      'Less mature tooling',
      'Can lead to data inconsistency',
      'Learning curve for complex queries'
    ],
    alternatives: [
      {
        technology: 'Cassandra',
        whenToUse: 'For massive scale and high availability requirements',
        tradeoffs: ['Excellent horizontal scaling', 'High availability', 'Complex data modeling', 'Steep learning curve']
      },
      {
        technology: 'Redis',
        whenToUse: 'For caching, sessions, or real-time data',
        tradeoffs: ['Extremely fast', 'In-memory storage', 'Limited data types', 'Not suitable as primary database']
      }
    ]
  }
};

// Backend framework decision rules
const BACKEND_RULES = {
  nodejs: {
    triggers: ['javascript', 'node', 'express', 'npm', 'async'],
    score: (analysis: TaskAnalysis) => {
      let score = 0;
      if (analysis.hasFrontend && !analysis.hasFastAPI) score += 0.4; // Same language as frontend
      if (analysis.features.includes('realtime')) score += 0.3;
      if (analysis.complexity === 'simple' || analysis.complexity === 'medium') score += 0.3;
      
      // Domain-specific adjustments
      if (analysis.hasFintech) score += 0.2; // Good ecosystem for financial APIs
      
      return Math.min(score, 1.0);
    },
    recommendation: 'Node.js with Express',
    reasoning: [
      'Same language as React frontend (JavaScript)',
      'Rich ecosystem with NPM packages',
      'Excellent for I/O-heavy applications',
      'Fast development with existing tooling'
    ],
    pros: [
      'Same language as frontend',
      'Rich NPM ecosystem',
      'Fast development',
      'Good async performance',
      'Large community'
    ],
    cons: [
      'Single-threaded limitations',
      'Callback complexity',
      'Less suitable for CPU-intensive tasks'
    ],
    alternatives: [
      {
        technology: 'Node.js with Fastify',
        whenToUse: 'When you need better performance than Express',
        tradeoffs: ['Faster than Express', 'Better TypeScript support', 'Smaller ecosystem', 'Less middleware']
      }
    ]
  },
  fastapi: {
    triggers: ['fastapi', 'python', 'async', 'performance', 'api'],
    score: (analysis: TaskAnalysis) => {
      let score = 0;
      if (analysis.hasFastAPI) score += 0.5; // Explicitly requested
      if (analysis.features.includes('api')) score += 0.3;
      if (analysis.complexity === 'complex') score += 0.2;
      
      // Domain-specific adjustments
      if (analysis.hasFintech) score += 0.3; // Excellent for financial calculations and data processing
      
      return Math.min(score, 1.0);
    },
    recommendation: 'Python with FastAPI',
    reasoning: [
      'Excellent performance for API-heavy applications',
      'Automatic API documentation',
      'Type safety with Pydantic',
      'Great async support'
    ],
    pros: [
      'High performance',
      'Auto-generated docs',
      'Type safety',
      'Great async support',
      'Modern Python features'
    ],
    cons: [
      'Smaller ecosystem than Node.js',
      'Python learning curve if team is JS-focused',
      'Less mature than Express'
    ],
    alternatives: [
      {
        technology: 'Python with Django',
        whenToUse: 'For full-stack applications with admin interface',
        tradeoffs: ['Batteries included', 'Admin interface', 'Heavier framework', 'More opinionated']
      },
      {
        technology: 'Python with Flask',
        whenToUse: 'For lightweight, flexible applications',
        tradeoffs: ['Lightweight', 'Flexible', 'More manual setup', 'Less features out of the box']
      }
    ]
  }
};

// Frontend framework decision rules
const FRONTEND_RULES = {
  react: {
    triggers: ['react', 'component', 'spa', 'interactive'],
    score: (analysis: TaskAnalysis) => {
      let score = 0;
      if (analysis.features.includes('frontend')) score += 0.4;
      if (analysis.projectType === 'web-app' || analysis.projectType === 'fullstack') score += 0.3;
      if (analysis.complexity === 'medium' || analysis.complexity === 'complex') score += 0.3;
      return Math.min(score, 1.0);
    },
    recommendation: 'React with TypeScript',
    reasoning: [
      'Most popular and mature frontend framework',
      'Large ecosystem and community',
      'Component-based architecture',
      'Excellent tooling and development experience'
    ],
    pros: [
      'Large ecosystem',
      'Component-based',
      'Great tooling',
      'Strong community',
      'Flexible'
    ],
    cons: [
      'Learning curve',
      'Rapid changes',
      'Can be overkill for simple apps'
    ],
    alternatives: [
      {
        technology: 'Vue.js',
        whenToUse: 'For teams wanting a gentler learning curve',
        tradeoffs: ['Easier to learn', 'Good documentation', 'Smaller ecosystem', 'Less job market']
      },
      {
        technology: 'Svelte',
        whenToUse: 'For performance-critical applications',
        tradeoffs: ['Better performance', 'Smaller bundle size', 'Smaller ecosystem', 'Less mature']
      }
    ]
  }
};

export class DecisionEngine {
  analyzeDatabase(analysis: TaskAnalysis): TechnologyComparison {
    const sqlScore = DATABASE_RULES.sql.score(analysis);
    const nosqlScore = DATABASE_RULES.nosql.score(analysis);
    
    const isSQL = sqlScore > nosqlScore;
    const rules = isSQL ? DATABASE_RULES.sql : DATABASE_RULES.nosql;
    const baseConfidence = Math.max(sqlScore, nosqlScore);
    
    // Calculate dynamic confidence based on multiple factors
    const confidence = this.calculateDatabaseConfidence(analysis, isSQL, baseConfidence);
    
    // Get domain-specific reasoning
    let reasoning = rules.reasoning;
    
    // Add domain-specific reasoning for fintech
    if (analysis.hasFintech && isSQL) {
      reasoning = [
        'ACID compliance essential for financial transactions',
        'Regulatory compliance (SOX, PCI DSS) requirements',
        'Audit trails and transaction logging capabilities',
        'Data integrity critical for financial calculations',
        'Complex financial reporting with joins and aggregations'
      ];
    }
    
    return {
      recommendation: rules.recommendation,
      confidence: Math.round(confidence * 100) / 100,
      reasoning: reasoning,
      tradeoffs: {
        pros: rules.pros,
        cons: rules.cons
      },
      alternatives: rules.alternatives,
      implementation: {
        complexity: analysis.complexity === 'complex' ? 'high' : analysis.complexity === 'medium' ? 'medium' : 'low',
        timeline: this.getDatabaseTimeline(analysis.complexity),
        learningCurve: isSQL ? 'Medium - SQL knowledge required' : 'Low - JSON-like structure'
      }
    };
  }

  analyzeBackend(analysis: TaskAnalysis): TechnologyComparison {
    const nodejsScore = BACKEND_RULES.nodejs.score(analysis);
    const fastapiScore = BACKEND_RULES.fastapi.score(analysis);
    
    const isNodeJS = nodejsScore > fastapiScore;
    const rules = isNodeJS ? BACKEND_RULES.nodejs : BACKEND_RULES.fastapi;
    const baseConfidence = Math.max(nodejsScore, fastapiScore);
    
    // Calculate dynamic confidence
    const confidence = this.calculateBackendConfidence(analysis, isNodeJS, baseConfidence);
    
    return {
      recommendation: rules.recommendation,
      confidence: Math.round(confidence * 100) / 100,
      reasoning: rules.reasoning,
      tradeoffs: {
        pros: rules.pros,
        cons: rules.cons
      },
      alternatives: rules.alternatives,
      implementation: {
        complexity: analysis.complexity === 'complex' ? 'high' : analysis.complexity === 'medium' ? 'medium' : 'low',
        timeline: this.getBackendTimeline(analysis.complexity),
        learningCurve: isNodeJS ? 'Low if team knows JavaScript' : 'Medium - Python learning curve'
      }
    };
  }

  analyzeFrontend(analysis: TaskAnalysis): TechnologyComparison {
    const reactScore = FRONTEND_RULES.react.score(analysis);
    const rules = FRONTEND_RULES.react;
    
    // Calculate dynamic confidence
    const confidence = this.calculateFrontendConfidence(analysis, reactScore);
    
    return {
      recommendation: rules.recommendation,
      confidence: Math.round(confidence * 100) / 100,
      reasoning: rules.reasoning,
      tradeoffs: {
        pros: rules.pros,
        cons: rules.cons
      },
      alternatives: rules.alternatives,
      implementation: {
        complexity: analysis.complexity === 'complex' ? 'high' : analysis.complexity === 'medium' ? 'medium' : 'low',
        timeline: this.getFrontendTimeline(analysis.complexity),
        learningCurve: 'Medium - Component-based thinking required'
      }
    };
  }

  private getDatabaseTimeline(complexity: string): string {
    switch (complexity) {
      case 'simple': return '1-2 days';
      case 'medium': return '3-5 days';
      case 'complex': return '1-2 weeks';
      default: return '3-5 days';
    }
  }

  private getBackendTimeline(complexity: string): string {
    switch (complexity) {
      case 'simple': return '1-2 weeks';
      case 'medium': return '2-3 weeks';
      case 'complex': return '3-6 weeks';
      default: return '2-3 weeks';
    }
  }

  private getFrontendTimeline(complexity: string): string {
    switch (complexity) {
      case 'simple': return '1-2 weeks';
      case 'medium': return '2-4 weeks';
      case 'complex': return '4-8 weeks';
      default: return '2-4 weeks';
    }
  }

  private calculateDatabaseConfidence(analysis: TaskAnalysis, isSQL: boolean, baseConfidence: number): number {
    let confidence = baseConfidence;
    
    // Domain-specific confidence boosters
    if (analysis.hasFintech && isSQL) {
      confidence += 0.2; // High confidence for fintech + SQL
    }
    
    if (analysis.hasHealthcare && isSQL) {
      confidence += 0.15; // High confidence for healthcare + SQL
    }
    
    if (analysis.hasEcommerce && isSQL) {
      confidence += 0.1; // Medium confidence for e-commerce + SQL
    }
    
    // Feature-based confidence adjustments
    if (analysis.hasAuth && isSQL) {
      confidence += 0.1; // Auth works well with SQL
    }
    
    if (analysis.features.includes('payment') && isSQL) {
      confidence += 0.15; // Payments need ACID compliance
    }
    
    // Complexity-based adjustments
    if (analysis.complexity === 'complex' && isSQL) {
      confidence += 0.1; // Complex apps benefit from SQL structure
    }
    
    // Penalty for conflicting choices
    if (analysis.hasFintech && !isSQL) {
      confidence -= 0.3; // Fintech should avoid NoSQL
    }
    
    if (analysis.hasHealthcare && !isSQL) {
      confidence -= 0.25; // Healthcare should avoid NoSQL
    }
    
    // Score difference factor (how clear the decision is)
    const sqlScore = DATABASE_RULES.sql.score(analysis);
    const nosqlScore = DATABASE_RULES.nosql.score(analysis);
    const scoreDifference = Math.abs(sqlScore - nosqlScore);
    
    if (scoreDifference > 0.5) {
      confidence += 0.1; // Clear decision
    } else if (scoreDifference < 0.2) {
      confidence -= 0.1; // Unclear decision
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private calculateBackendConfidence(analysis: TaskAnalysis, isNodeJS: boolean, baseConfidence: number): number {
    let confidence = baseConfidence;
    
    // Language consistency boost
    if (analysis.hasFrontend && isNodeJS) {
      confidence += 0.15; // Same language as frontend
    }
    
    // Domain-specific adjustments
    if (analysis.hasFintech && !isNodeJS) {
      confidence += 0.1; // Python/FastAPI good for financial calculations
    }
    
    // Feature-based adjustments
    if (analysis.hasRealtime && isNodeJS) {
      confidence += 0.1; // Node.js good for real-time
    }
    
    if (analysis.features.includes('api') && !isNodeJS) {
      confidence += 0.1; // FastAPI excellent for APIs
    }
    
    // Complexity adjustments
    if (analysis.complexity === 'complex' && !isNodeJS) {
      confidence += 0.05; // Python better for complex logic
    }
    
    // Explicit technology requests
    if (analysis.hasFastAPI) {
      confidence += 0.2; // User explicitly requested FastAPI
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private calculateFrontendConfidence(analysis: TaskAnalysis, baseConfidence: number): number {
    let confidence = baseConfidence;
    
    // Project type adjustments
    if (analysis.projectType === 'web-app' || analysis.projectType === 'fullstack') {
      confidence += 0.1; // React is standard for web apps
    }
    
    // Complexity adjustments
    if (analysis.complexity === 'medium' || analysis.complexity === 'complex') {
      confidence += 0.1; // React good for complex UIs
    }
    
    // Feature-based adjustments
    if (analysis.hasRealtime) {
      confidence += 0.05; // React good for real-time updates
    }
    
    // Team consistency (if backend is Node.js)
    if (analysis.hasBackend) {
      confidence += 0.05; // Same ecosystem
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }
}
