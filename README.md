# Traycer Lite - Planning Layer for AI Development

A simplified version of Traycer that demonstrates a "planning layer" web application sitting between developer intent and coding agents. The core innovation: transform vague coding tasks into detailed, structured, phase-by-phase implementation plans BEFORE any code is written.

## 🎯 Key Features

- **Instant Base Plan**: Rule-based engine generates detailed plans in <100ms
- **AI Enhancement**: GPT-4 adds intelligent details and technical reasoning
- **Hybrid Architecture**: Combines fast rule-based planning with AI enhancement
- **Progressive Updates**: UI shows base plan immediately, then enhances progressively
- **Demo Mode**: Works perfectly without API key, enhanced with OpenAI key
- **Agent Ready**: Hand off detailed plans to any AI coding agent

## 🏗️ Architecture

```
User Input (Task Description)
    ↓
Rule-Based Engine (Fast, 50ms)
    ├── Pattern matching for project type
    ├── Feature detection (auth, database, etc.)
    ├── Phase structure generation
    └── File mapping
    ↓
Base Plan Displayed Immediately ← User sees this right away
    ↓
OpenAI GPT-4 Enhancement (Background, 2-3s per phase)
    ├── Enriches phase descriptions
    ├── Adds implementation details
    ├── Provides technical reasoning
    └── Identifies risks and best practices
    ↓
Plan Updates Live (Smooth animations as each phase completes)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd traycer-lite
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

#### Demo Mode (No API Key Required)

```bash
# Start both backend and frontend
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

The app works perfectly in demo mode with rule-based planning only.

#### Enhanced Mode (With OpenAI API Key)

1. **Add your OpenAI API key:**
   - Click "Settings" in the app
   - Enter your OpenAI API key
   - Test the connection
   - Save

2. **Generate enhanced plans:**
   - Enter a coding task
   - See base plan immediately
   - Watch as GPT-4 enhances each phase progressively

## 🧪 Testing

### Run Planner Unit Tests

```bash
cd backend
npm test
```

### Expected Test Results

The test suite includes:
- Web app with authentication planning
- REST API planning
- CLI tool planning
- E-commerce platform planning
- Real-time chat application planning
- Minimal task handling
- Dependency validation
- File structure generation
- Tech stack selection

All tests should pass, demonstrating the rule-based planner's deterministic behavior.

## 📁 Project Structure

```
traycer-lite/
├── backend/
│   ├── src/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── planner.ts            # Rule-based planning engine
│   │   ├── openaiService.ts      # GPT-4 integration with caching
│   │   ├── planOrchestrator.ts   # Coordinates rule-based + LLM
│   │   ├── agent.ts              # Mock agent for demo execution
│   │   └── server.ts             # Express API endpoints
│   ├── tests/
│   │   └── planner.test.ts       # Unit tests for planner
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── services/            # API client
│   │   ├── hooks/               # Custom React hooks
│   │   └── types.ts             # Frontend types
│   └── package.json
└── package.json                 # Root package.json
```

## 🔧 API Endpoints

### POST /api/plan
Generate a new implementation plan.

**Request:**
```json
{
  "task": "Build a task management app with user authentication"
}
```

**Response:**
```json
{
  "plan": {
    "id": "plan-1234567890",
    "task": "Build a task management app with user authentication",
    "overview": "Implementation plan with 6 phases...",
    "phases": [...],
    "techStack": ["TypeScript", "React", "Express.js", ...],
    "risks": ["Security considerations for user authentication..."],
    "generationMethod": "rule-based"
  },
  "taskHash": "abc123def456"
}
```

### GET /api/plan-status?taskHash=...
Get plan enhancement status and progress.

**Response:**
```json
{
  "taskHash": "abc123def456",
  "basePlan": {...},
  "enhancedPhases": {
    "0": {
      "id": "phase-setup",
      "name": "Project Setup & Architecture",
      "description": "Enhanced description...",
      "reasoning": "This approach ensures...",
      "files": [...]
    },
    "1": "failed"
  },
  "progress": {
    "current": 2,
    "total": 6
  }
}
```

### POST /api/execute
Execute a phase with the mock agent.

**Request:**
```json
{
  "step": {
    "id": "phase-setup",
    "name": "Project Setup & Architecture",
    "description": "...",
    "files": [...],
    "dependencies": [],
    "estimatedTime": "30 minutes",
    "status": "ready"
  }
}
```

**Response:**
```json
{
  "result": {
    "stepId": "phase-setup",
    "success": true,
    "output": "✅ Project Setup Complete\n\nGenerated files:\n📄 package.json\n📄 tsconfig.json\n..."
  }
}
```

## 🎨 Frontend Components

### TaskInput
- Text area for task description
- Example tasks for inspiration
- Settings modal for API key configuration
- Value proposition display

### PlanViewer
- Plan overview with tech stack and risks
- Enhancement progress badge
- Collapsible phase cards
- Execution logs display

### PhaseCard
- Phase details with file listings
- Status indicators (ready/enhancing/enhanced/failed)
- Run Agent button for execution
- AI reasoning display (when enhanced)

### EnhancementBadge
- Shows enhancement progress
- Animated transitions
- Completion status

## 🔒 Security Considerations

### API Key Management

**Demo Mode (Client-side):**
- API key stored in localStorage
- Clear security warnings displayed
- Suitable for development/testing only

**Production Mode (Recommended):**
- Use backend proxy for API key
- Store keys in environment variables
- Implement proper authentication

### Environment Variables

```bash
# Backend (.env)
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=production
PORT=3001
```

### ⚠️ CRITICAL: Never Commit Secrets

**IMPORTANT SECURITY GUIDELINES:**

1. **Never commit API keys, passwords, or tokens to version control**
2. **Always use environment variables for sensitive data**
3. **Use `.env.local` files for local development (already in .gitignore)**
4. **Test scripts are located in `backend/scripts/` (excluded from git)**
5. **If you accidentally commit secrets:**
   - Rotate/revoke the exposed credentials immediately
   - Use tools like `git filter-repo` or BFG to purge history
   - Force push to remove secrets from git history

**Example .env.local file:**
```bash
# Create this file in project root (never commit this file)
OPENAI_API_KEY=sk-your-actual-key-here
```

**Safe testing approach:**
```bash
# Use the test script in backend/scripts/ (excluded from git)
cd backend/scripts
node test-llm-response.js
```

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
npm run build
npm start
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting provider
```

### Docker Deployment

```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧠 How It Works

### Rule-Based Planning Engine

1. **Pattern Detection**: Analyzes task description for keywords
2. **Feature Extraction**: Identifies auth, database, realtime, etc.
3. **Phase Generation**: Creates structured phases based on features
4. **File Mapping**: Generates specific file paths and actions
5. **Dependency Resolution**: Ensures proper phase ordering

### AI Enhancement Process

1. **Background Processing**: Enhances phases without blocking UI
2. **Per-Phase Enhancement**: Individual GPT-4 calls for each phase
3. **Validation & Repair**: Validates JSON responses, retries on failure
4. **Caching**: SHA256-based caching with 24h TTL
5. **Progressive Updates**: UI updates as enhancements complete

### Mock Agent Execution

1. **Deterministic Output**: Returns predictable results based on phase content
2. **Realistic Simulation**: Mimics actual agent behavior
3. **Execution Logs**: Tracks all agent outputs
4. **Error Handling**: Simulates both success and failure scenarios

## 🎯 Example Tasks

Try these example tasks to see the planner in action:

1. **"Build a task management app with user authentication and real-time updates"**
2. **"Create a REST API for a blog with comments, likes, and user profiles"**
3. **"Real-time chat application with rooms, direct messages, and file sharing"**
4. **"E-commerce platform with Stripe payment integration and inventory management"**
5. **"CLI tool for analyzing Git repositories and generating commit reports"**

## 🔧 Configuration

### OpenAI Settings

- **Model**: GPT-4 (configurable)
- **Max Tokens**: 400 per phase
- **Temperature**: 0.3 for consistency
- **Max Concurrency**: 3 simultaneous requests
- **Cache TTL**: 24 hours

### Performance Tuning

- **Rule-based planning**: <100ms response time
- **AI enhancement**: 2-3s per phase
- **Caching**: Reduces API calls by ~80%
- **Concurrency**: Balances speed vs. rate limits

## 🐛 Troubleshooting

### Common Issues

1. **"API key test failed"**
   - Check your OpenAI API key
   - Ensure you have credits in your OpenAI account
   - Verify network connectivity

2. **"Plan not found or expired"**
   - Plans expire after 1 hour
   - Generate a new plan if needed

3. **"Enhancement failed"**
   - Check OpenAI API status
   - Verify API key permissions
   - Base plan remains functional

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- React team for the excellent framework
- Tailwind CSS for the utility-first styling
- Express.js for the robust backend framework

---

**Built with ❤️ for the AI development community**
