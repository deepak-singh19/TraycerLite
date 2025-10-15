import { Phase, AgentResult } from './types.js';

// Mock agent that returns deterministic outputs based on phase content
export function runAgent(phase: Phase): AgentResult {
  const phaseName = phase.name.toLowerCase();
  const phaseDescription = phase.description.toLowerCase();
  
  // Determine output based on phase name and content
  let output: string;
  let success = true;

  if (phaseName.includes('setup') || phaseName.includes('scaffold')) {
    output = generateSetupOutput(phase);
  } else if (phaseName.includes('auth') || phaseDescription.includes('authentication')) {
    output = generateAuthOutput(phase);
  } else if (phaseName.includes('database') || phaseDescription.includes('database')) {
    output = generateDatabaseOutput(phase);
  } else if (phaseName.includes('backend') || phaseName.includes('api')) {
    output = generateBackendOutput(phase);
  } else if (phaseName.includes('frontend') || phaseDescription.includes('frontend')) {
    output = generateFrontendOutput(phase);
  } else if (phaseName.includes('test') || phaseDescription.includes('test')) {
    output = generateTestOutput(phase);
  } else {
    output = generateGenericOutput(phase);
  }

  return {
    stepId: phase.id,
    success,
    output,
  };
}

function generateSetupOutput(phase: Phase): string {
  return `
✅ Project Setup Complete

Generated files:
${phase.files.map(f => `📄 ${f.path}`).join('\n')}

Key actions performed:
• Initialized Node.js project with TypeScript
• Configured build scripts and development environment
• Set up ESLint and Prettier for code quality
• Created basic project structure

Next steps:
• Review generated package.json and adjust dependencies as needed
• Configure environment variables
• Set up version control (git init, .gitignore)

Estimated completion time: ${phase.estimatedTime || '30 minutes'}
  `.trim();
}

function generateAuthOutput(phase: Phase): string {
  return `
🔐 Authentication System Implemented

Generated files:
${phase.files.map(f => `📄 ${f.path}`).join('\n')}

Key features implemented:
• JWT token-based authentication
• Password hashing with bcrypt
• Role-based access control middleware
• Login/register endpoints with validation
• Token refresh mechanism

Security considerations:
• Passwords are hashed with salt rounds
• JWT tokens have expiration and refresh logic
• Rate limiting on auth endpoints
• Input validation and sanitization

Example JWT implementation:
\`\`\`typescript
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
\`\`\`

Estimated completion time: ${phase.estimatedTime || '60 minutes'}
  `.trim();
}

function generateDatabaseOutput(phase: Phase): string {
  return `
🗄️ Database Schema Created

Generated files:
${phase.files.map(f => `📄 ${f.path}`).join('\n')}

Database structure:
• Primary tables with proper relationships
• Indexes for performance optimization
• Migration scripts with rollback support
• Data seeding for development

Key tables created:
• Users (id, email, password_hash, created_at)
• Sessions (id, user_id, token, expires_at)
• Additional tables based on domain requirements

Example migration:
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
\`\`\`

Estimated completion time: ${phase.estimatedTime || '45 minutes'}
  `.trim();
}

function generateBackendOutput(phase: Phase): string {
  return `
🚀 Backend API Developed

Generated files:
${phase.files.map(f => `📄 ${f.path}`).join('\n')}

API endpoints created:
• RESTful routes with proper HTTP methods
• Request validation and error handling
• Middleware for authentication and logging
• CORS configuration for frontend integration

Key features:
• Express.js server with TypeScript
• Structured error handling
• Request/response logging
• Health check endpoints

Example route structure:
\`\`\`typescript
app.get('/api/users', authenticateToken, (req, res) => {
  // Get users logic
});

app.post('/api/users', validateUserInput, (req, res) => {
  // Create user logic
});
\`\`\`

Estimated completion time: ${phase.estimatedTime || '90 minutes'}
  `.trim();
}

function generateFrontendOutput(phase: Phase): string {
  return `
⚛️ Frontend Components Built

Generated files:
${phase.files.map(f => `📄 ${f.path}`).join('\n')}

React components created:
• Main application structure
• Responsive layout with Tailwind CSS
• Form components with validation
• Navigation and routing setup

Key features:
• Modern React with TypeScript
• Responsive design with Tailwind CSS
• Form handling with validation
• State management setup

Example component:
\`\`\`tsx
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Login logic
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
};
\`\`\`

Estimated completion time: ${phase.estimatedTime || '120 minutes'}
  `.trim();
}

function generateTestOutput(phase: Phase): string {
  return `
🧪 Test Suite Implemented

Generated files:
${phase.files.map(f => `📄 ${f.path}`).join('\n')}

Test coverage:
• Unit tests for core functions
• Integration tests for API endpoints
• Component tests for React components
• End-to-end test scenarios

Testing setup:
• Jest configuration with TypeScript support
• Test utilities and mocks
• Coverage reporting
• CI/CD integration ready

Example test:
\`\`\`typescript
describe('User Authentication', () => {
  test('should hash password correctly', async () => {
    const password = 'testpassword';
    const hashed = await hashPassword(password);
    expect(hashed).not.toBe(password);
    expect(await comparePassword(password, hashed)).toBe(true);
  });
});
\`\`\`

Estimated completion time: ${phase.estimatedTime || '60 minutes'}
  `.trim();
}

function generateGenericOutput(phase: Phase): string {
  return `
✅ Phase Implementation Complete

Generated files:
${phase.files.map(f => `📄 ${f.path}`).join('\n')}

Implementation details:
• All specified files have been created
• Code follows best practices and conventions
• Proper error handling implemented
• Documentation and comments added

Key accomplishments:
• ${phase.description}
• Files structured according to project architecture
• Ready for integration with other phases

Next steps:
• Review generated code
• Run tests to ensure functionality
• Deploy to development environment

Estimated completion time: ${phase.estimatedTime || '60 minutes'}
  `.trim();
}
