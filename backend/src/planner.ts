import { Plan, Phase, TaskAnalysis, FileChange } from './types.js';
import { analyzeTask } from './analysis.js';

// Phase generation templates
function generateSetupPhase(analysis: TaskAnalysis): Phase {
  const files: FileChange[] = [];
  
  if (analysis.hasFastAPI) {
    // FastAPI setup files
    files.push(
      {
        path: 'requirements.txt',
        action: 'create',
        description: 'Python dependencies',
        details: [
          'FastAPI and Uvicorn for server',
          'SQLAlchemy for database',
          'Pydantic for validation',
          'Development dependencies',
        ],
      },
      {
        path: 'app/__init__.py',
        action: 'create',
        description: 'Application package initialization',
        details: [
          'Empty __init__.py file',
        ],
      },
      {
        path: 'app/main.py',
        action: 'create',
        description: 'FastAPI application configuration',
        details: [
          'FastAPI app initialization',
          'CORS middleware setup',
          'Route registration',
        ],
      },
      {
        path: '.env',
        action: 'create',
        description: 'Environment variables',
        details: [
          'Database connection string',
          'API keys and secrets',
          'Environment-specific settings',
        ],
      }
    );
  } else {
    // Node.js/TypeScript setup files
    files.push(
      {
        path: 'package.json',
        action: 'create',
        description: 'Initialize Node.js project with dependencies',
        details: [
          'Set up TypeScript with strict mode',
          'Add essential dependencies',
          'Configure build and dev scripts',
        ],
      },
      {
        path: 'tsconfig.json',
        action: 'create',
        description: 'TypeScript configuration',
        details: [
          'Enable strict type checking',
          'Set module resolution to Node',
          'Configure path aliases for clean imports',
        ],
      },
      {
        path: 'src/types/index.ts',
        action: 'create',
        description: 'Define core TypeScript interfaces',
        details: [
          'Create domain models',
          'Define API request/response types',
          'Add utility types',
        ],
      }
    );
  }
  
  return {
    id: 'phase-setup',
    name: 'Project Setup & Architecture',
    description: 'Initialize project structure and configure development environment',
    status: 'ready',
    estimatedTime: '30 minutes',
    dependencies: [],
    files,
  };
}

function generateDatabasePhase(analysis: TaskAnalysis): Phase {
  const files: FileChange[] = [];
  
  if (analysis.hasFastAPI) {
    // FastAPI database files
    files.push(
      {
        path: 'app/database.py',
        action: 'create',
        description: 'Database configuration and connection',
        details: [
          'SQLAlchemy engine setup',
          'Database session management',
          'Connection pooling configuration',
        ],
      },
      {
        path: 'app/models/__init__.py',
        action: 'create',
        description: 'Models package initialization',
        details: [
          'Empty __init__.py file',
        ],
      },
      // Add domain-specific models
      ...(analysis.hasFintech ? [{
        path: 'app/models/loan.py',
        action: 'create' as const,
        description: 'Loan model definition',
        details: [
          'SQLAlchemy model for loans table',
          'Credit score and payment history',
          'Compliance and audit fields',
          'Define relationships and constraints',
        ],
      }] : analysis.hasEcommerce ? [{
        path: 'app/models/product.py',
        action: 'create' as const,
        description: 'Product model definition',
        details: [
          'SQLAlchemy model for products table',
          'Category and inventory relationships',
          'Price and variant management',
          'Define relationships and constraints',
        ],
      }] : [{
        path: 'app/models/base.py',
        action: 'create' as const,
        description: 'Base model definition',
        details: [
          'SQLAlchemy base model',
          'Common fields and relationships',
          'Add validation and indexes',
        ],
      }]),
      {
        path: 'alembic.ini',
        action: 'create',
        description: 'Alembic configuration',
        details: [
          'Database migration tool setup',
          'Connection string configuration',
        ],
      },
      {
        path: 'alembic/env.py',
        action: 'create',
        description: 'Alembic environment configuration',
        details: [
          'Migration environment setup',
          'Model metadata configuration',
        ],
      }
    );
  } else {
    // Node.js database files
    files.push(
      {
        path: 'src/database/schema.sql',
        action: 'create',
        description: 'Database schema definition',
        details: [
          'Create tables based on domain requirements',
          'Define relationships and constraints',
          'Add indexes for performance',
        ],
      },
      {
        path: 'src/database/migrations/001_initial.sql',
        action: 'create',
        description: 'Initial database migration',
        details: [
          'Create migration script',
          'Include rollback instructions',
          'Add data seeding if needed',
        ],
      }
    );
  }

  if (analysis.hasAuth) {
    files.push({
      path: 'src/database/models/User.ts',
      action: 'create',
      description: 'User model definition',
      details: [
        'Define user schema',
        'Add authentication fields',
        'Include validation rules',
      ],
    });
  }

  return {
    id: 'phase-database',
    name: 'Database Design & Setup',
    description: 'Design and implement database schema with proper relationships',
    status: 'ready',
    estimatedTime: '45 minutes',
    dependencies: ['phase-setup'],
    files,
  };
}

function generateAuthPhase(analysis: TaskAnalysis): Phase {
  return {
    id: 'phase-auth',
    name: 'Authentication System',
    description: 'Implement user authentication and authorization',
    status: 'ready',
    estimatedTime: '60 minutes',
    dependencies: ['phase-setup', 'phase-database'],
    files: [
      {
        path: 'src/auth/middleware.ts',
        action: 'create',
        description: 'Authentication middleware',
        details: [
          'JWT token validation',
          'Role-based access control',
          'Session management',
        ],
      },
      {
        path: 'src/auth/routes.ts',
        action: 'create',
        description: 'Authentication routes',
        details: [
          'Login and register endpoints',
          'Password reset functionality',
          'Token refresh mechanism',
        ],
      },
      {
        path: 'src/auth/utils.ts',
        action: 'create',
        description: 'Authentication utilities',
        details: [
          'Password hashing with bcrypt',
          'JWT token generation',
          'Validation helpers',
        ],
      },
    ],
  };
}

function generateBackendPhase(analysis: TaskAnalysis): Phase {
  const files: FileChange[] = [];
  
  if (analysis.hasFastAPI) {
    // FastAPI backend files
    files.push(
      {
        path: 'main.py',
        action: 'create',
        description: 'FastAPI application entry point',
        details: [
          'FastAPI app initialization',
          'Middleware configuration',
          'Route registration',
          'CORS setup',
        ],
      },
      {
        path: 'app/routers/__init__.py',
        action: 'create',
        description: 'Router package initialization',
        details: [
          'Empty __init__.py file',
        ],
      }
    );
    
    // Add domain-specific routes
    if (analysis.hasFintech) {
      files.push({
        path: 'app/routers/loans.py',
        action: 'create',
        description: 'Loan management API routes',
        details: [
          'Loan application endpoints',
          'Credit scoring integration',
          'Payment processing routes',
          'Compliance and audit logging',
        ],
      });
    } else if (analysis.hasEcommerce) {
      files.push({
        path: 'app/routers/products.py',
        action: 'create',
        description: 'Product catalog API routes',
        details: [
          'Product CRUD operations',
          'Inventory management',
          'Category management',
          'Search and filtering',
        ],
      });
    } else {
      files.push({
        path: 'app/routers/api.py',
        action: 'create',
        description: 'Main API routes',
        details: [
          'RESTful endpoint structure',
          'Request/response models',
          'Error handling',
          'Database integration',
        ],
      });
    }
    
    files.push(
      {
        path: 'app/models/__init__.py',
        action: 'create',
        description: 'Models package initialization',
        details: [
          'Empty __init__.py file',
        ],
      }
    );
    
    // Add domain-specific models
    if (analysis.hasFintech) {
      files.push({
        path: 'app/models/loan.py',
        action: 'create',
        description: 'Loan data models',
        details: [
          'Loan application model',
          'Credit score model',
          'Payment history model',
          'Compliance tracking model',
        ],
      });
    } else if (analysis.hasEcommerce) {
      files.push({
        path: 'app/models/product.py',
        action: 'create',
        description: 'Product data models',
        details: [
          'Product model with variants',
          'Category model',
          'Inventory model',
          'Order model',
        ],
      });
    } else {
      files.push({
        path: 'app/models/base.py',
        action: 'create',
        description: 'Base data models',
        details: [
          'Pydantic models for validation',
          'Database models',
          'Response schemas',
        ],
      });
    }
    
    files.push(
      {
        path: 'app/database.py',
        action: 'create',
        description: 'Database configuration',
        details: [
          'SQLAlchemy setup',
          'Database connection',
          'Session management',
        ],
      },
      {
        path: 'requirements.txt',
        action: 'create',
        description: 'Python dependencies',
        details: [
          'FastAPI and Uvicorn',
          'SQLAlchemy and database drivers',
          'Pydantic for validation',
        ],
      }
    );
  } else {
    // Express.js backend files
    files.push(
      {
        path: 'src/server.ts',
        action: 'create',
        description: 'Main server entry point',
        details: [
          'Express.js server setup',
          'Middleware configuration',
          'Route registration',
        ],
      }
    );
    
    // Add domain-specific routes
    if (analysis.hasFintech) {
      files.push({
        path: 'src/routes/loans.ts',
        action: 'create',
        description: 'Loan management routes',
        details: [
          'Loan application endpoints',
          'Credit scoring integration',
          'Payment processing routes',
          'Compliance and audit logging',
        ],
      });
    } else if (analysis.hasEcommerce) {
      files.push({
        path: 'src/routes/products.ts',
        action: 'create',
        description: 'Product catalog routes',
        details: [
          'Product CRUD operations',
          'Inventory management',
          'Category management',
          'Search and filtering',
        ],
      });
    } else {
      files.push({
        path: 'src/routes/index.ts',
        action: 'create',
        description: 'API route definitions',
        details: [
          'RESTful endpoint structure',
          'Request validation',
          'Error handling',
        ],
      });
    }
  }

  if (analysis.hasRealtime) {
    files.push({
      path: 'src/websocket/handler.ts',
      action: 'create',
      description: 'WebSocket connection handler',
      details: [
        'Socket.io integration',
        'Room management',
        'Real-time event handling',
      ],
    });
  }

  return {
    id: 'phase-backend',
    name: 'Backend API Development',
    description: 'Build RESTful API with proper error handling and validation',
    status: 'ready',
    estimatedTime: '90 minutes',
    dependencies: analysis.hasDatabase ? ['phase-database'] : ['phase-setup'],
    files,
  };
}

function generateFrontendPhase(analysis: TaskAnalysis): Phase {
  const files: FileChange[] = [
    {
      path: 'src/components/App.tsx',
      action: 'create',
      description: 'Main application component',
      details: [
        'React component structure',
        'State management setup',
        'Routing configuration',
      ],
    },
    {
      path: 'src/components/Layout.tsx',
      action: 'create',
      description: 'Application layout wrapper',
      details: [
        'Header and navigation',
        'Footer component',
        'Responsive design',
      ],
    },
  ];

  // Add domain-specific components
  if (analysis.hasFintech) {
    files.push(
      {
        path: 'src/components/LoanApplication.tsx',
        action: 'create',
        description: 'Loan application form component',
        details: [
          'Multi-step loan application form',
          'Credit score display',
          'Document upload functionality',
          'Progress tracking',
        ],
      },
      {
        path: 'src/components/LoanDashboard.tsx',
        action: 'create',
        description: 'Loan management dashboard',
        details: [
          'Loan status overview',
          'Payment history display',
          'Compliance reporting',
          'Financial calculations',
        ],
      }
    );
  } else if (analysis.hasEcommerce) {
    files.push(
      {
        path: 'src/components/ProductCatalog.tsx',
        action: 'create',
        description: 'Product catalog component',
        details: [
          'Product grid display',
          'Search and filtering',
          'Category navigation',
          'Product details modal',
        ],
      },
      {
        path: 'src/components/ShoppingCart.tsx',
        action: 'create',
        description: 'Shopping cart component',
        details: [
          'Cart item management',
          'Quantity updates',
          'Price calculations',
          'Checkout integration',
        ],
      }
    );
  }

  if (analysis.hasAuth) {
    files.push({
      path: 'src/components/Auth/LoginForm.tsx',
      action: 'create',
      description: 'User login form',
      details: [
        'Form validation',
        'API integration',
        'Error handling',
      ],
    });
  }

  return {
    id: 'phase-frontend',
    name: 'Frontend Development',
    description: 'Build responsive user interface with modern React patterns',
    status: 'ready',
    estimatedTime: '120 minutes',
    dependencies: analysis.hasBackend ? ['phase-backend'] : ['phase-setup'],
    files,
  };
}

function generateTestingPhase(analysis: TaskAnalysis): Phase {
  const files: FileChange[] = [];
  
  if (analysis.hasFastAPI) {
    // FastAPI testing files
    files.push(
      {
        path: 'pytest.ini',
        action: 'create',
        description: 'Pytest configuration',
        details: [
          'Test discovery settings',
          'Coverage reporting',
          'Test markers and options',
        ],
      },
      {
        path: 'conftest.py',
        action: 'create',
        description: 'Pytest fixtures and configuration',
        details: [
          'Test database setup',
          'FastAPI test client fixtures',
          'Common test utilities',
        ],
      }
    );
  } else {
    // Node.js testing files
    files.push(
      {
        path: 'jest.config.js',
        action: 'create',
        description: 'Jest testing configuration',
        details: [
          'Test environment setup',
          'Coverage reporting',
          'Mock configurations',
        ],
      }
    );
  }

  if (analysis.hasBackend) {
    if (analysis.hasFastAPI) {
      files.push({
        path: 'tests/test_api.py',
        action: 'create',
        description: 'FastAPI endpoint tests',
        details: [
          'Integration tests for routes',
          'Authentication testing',
          'Error scenario coverage',
          'Pydantic model validation',
        ],
      });
    } else {
      files.push({
        path: 'src/__tests__/api.test.ts',
        action: 'create',
        description: 'API endpoint tests',
        details: [
          'Integration tests for routes',
          'Authentication testing',
          'Error scenario coverage',
        ],
      });
    }
  }

  if (analysis.hasFrontend) {
    files.push({
      path: 'src/__tests__/components.test.tsx',
      action: 'create',
      description: 'Component unit tests',
      details: [
        'React Testing Library setup',
        'Component behavior testing',
        'User interaction testing',
      ],
    });
  }

  return {
    id: 'phase-testing',
    name: 'Testing & Quality Assurance',
    description: 'Implement comprehensive test suite for reliability',
    status: 'ready',
    estimatedTime: '60 minutes',
    dependencies: analysis.hasFrontend ? ['phase-frontend'] : analysis.hasBackend ? ['phase-backend'] : ['phase-setup'],
    files,
  };
}

// Generate phases based on analysis
function generatePhases(analysis: TaskAnalysis): Phase[] {
  const phases: Phase[] = [];
  
  // Phase 1: Always include setup
  phases.push(generateSetupPhase(analysis));
  
  // Phase 2: Database (if needed)
  if (analysis.hasDatabase) {
    phases.push(generateDatabasePhase(analysis));
  }
  
  // Phase 3: Authentication (if needed)
  if (analysis.hasAuth) {
    phases.push(generateAuthPhase(analysis));
  }
  
  // Phase 4: Backend/API (if needed)
  if (analysis.hasBackend) {
    phases.push(generateBackendPhase(analysis));
  }
  
  // Phase 5: Frontend (if needed)
  if (analysis.hasFrontend) {
    phases.push(generateFrontendPhase(analysis));
  }
  
  // Phase N: Always include testing
  phases.push(generateTestingPhase(analysis));
  
  return phases;
}

// Determine tech stack based on analysis
function determineTechStack(analysis: TaskAnalysis): string[] {
  const techStack: string[] = [];
  
  if (analysis.hasFastAPI) {
    techStack.push('Python', 'FastAPI', 'Uvicorn');
  } else {
    techStack.push('TypeScript', 'Node.js');
  }
  
  if (analysis.hasFrontend) {
    techStack.push('React', 'Tailwind CSS');
  }
  
  if (analysis.hasBackend) {
    if (analysis.hasFastAPI) {
      // FastAPI uses SQLAlchemy instead of Prisma
      if (analysis.hasDatabase) {
        techStack.push('SQLAlchemy');
      }
    } else {
      techStack.push('Express.js');
    }
  }
  
  if (analysis.hasDatabase) {
    if (analysis.hasFastAPI) {
      techStack.push('PostgreSQL', 'SQLAlchemy');
    } else {
      techStack.push('PostgreSQL', 'Prisma');
    }
  }
  
  if (analysis.hasAuth) {
    if (analysis.hasFastAPI) {
      techStack.push('JWT', 'python-jose', 'passlib');
    } else {
      techStack.push('JWT', 'bcrypt');
    }
  }
  
  if (analysis.hasRealtime) {
    if (analysis.hasFastAPI) {
      techStack.push('WebSockets');
    } else {
      techStack.push('Socket.io');
    }
  }
  
  if (analysis.hasFastAPI) {
    techStack.push('pytest', 'black', 'flake8');
  } else {
    techStack.push('Jest', 'ESLint', 'Prettier');
  }
  
  return techStack;
}

// Identify potential risks based on analysis
function identifyRisks(analysis: TaskAnalysis): string[] {
  const risks: string[] = [];
  
  if (analysis.complexity === 'complex') {
    risks.push('High complexity may require additional planning and testing');
  }
  
  if (analysis.hasAuth) {
    risks.push('Security considerations for user authentication and data protection');
  }
  
  if (analysis.hasDatabase) {
    risks.push('Database schema changes may require careful migration planning');
  }
  
  if (analysis.hasRealtime) {
    risks.push('Real-time features may require additional infrastructure considerations');
  }
  
  if (analysis.features.includes('payment')) {
    risks.push('Payment integration requires PCI compliance and secure handling');
  }
  
  if (analysis.projectType === 'fullstack') {
    risks.push('Full-stack development requires coordination between frontend and backend teams');
  }
  
  return risks;
}

// Main planner function - pure function that generates a plan from a task
export function planTask(task: string): Plan {
  const analysis = analyzeTask(task);
  const phases = generatePhases(analysis);
  
  return {
    id: `plan-${Date.now()}`,
    task,
    overview: `Implementation plan with ${phases.length} phases. Each phase contains detailed file-level instructions for building a ${analysis.projectType} with ${analysis.features.join(', ')} features.`,
    phases,
    techStack: determineTechStack(analysis),
    risks: identifyRisks(analysis),
    generationMethod: 'rule-based',
  };
}
