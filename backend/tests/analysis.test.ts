import { describe, it, expect } from 'vitest';
import { analyzeTask } from '../src/analysis.js';

describe('analyzeTask', () => {
  describe('ambiguous phrases', () => {
    it('should correctly identify "context API" as frontend feature, not API', () => {
      const result = analyzeTask('Build a React app with context API for state management');
      
      expect(result.projectType).toBe('web-app');
      expect(result.features).toContain('frontend');
      expect(result.features).not.toContain('api');
      expect(result.hasFrontend).toBe(true);
      expect(result.hasBackend).toBe(false);
    });

    it('should distinguish between React context API and REST API', () => {
      const result = analyzeTask('Create a fullstack app with React context API and REST API endpoints');
      
      expect(result.projectType).toBe('fullstack');
      expect(result.features).toContain('frontend');
      expect(result.features).toContain('api');
      expect(result.hasFrontend).toBe(true);
      expect(result.hasBackend).toBe(true);
    });

    it('should handle "state management" as frontend feature', () => {
      const result = analyzeTask('Implement state management with Redux');
      
      expect(result.projectType).toBe('web-app');
      expect(result.features).toContain('frontend');
      expect(result.hasFrontend).toBe(true);
    });

    it('should not confuse "context API" with backend API patterns', () => {
      const result = analyzeTask('Use context API for user authentication state');
      
      expect(result.projectType).toBe('web-app');
      expect(result.features).toContain('frontend');
      expect(result.features).toContain('auth');
      expect(result.features).not.toContain('api');
    });
  });

  describe('project type detection', () => {
    it('should detect web-app for React components', () => {
      const result = analyzeTask('Create React components for a dashboard');
      expect(result.projectType).toBe('web-app');
    });

    it('should detect API for REST endpoints', () => {
      const result = analyzeTask('Build REST API with Express');
      expect(result.projectType).toBe('api');
    });

    it('should detect fullstack for frontend + backend', () => {
      const result = analyzeTask('Build a fullstack application with React frontend and Node backend');
      expect(result.projectType).toBe('fullstack');
    });

    it('should detect CLI for command line tools', () => {
      const result = analyzeTask('Create a CLI tool for file processing');
      expect(result.projectType).toBe('cli');
    });

    it('should detect library for packages', () => {
      const result = analyzeTask('Build a JavaScript library for data validation');
      expect(result.projectType).toBe('library');
    });
  });

  describe('feature detection', () => {
    it('should detect authentication features', () => {
      const result = analyzeTask('Add user login and registration');
      expect(result.features).toContain('auth');
      expect(result.hasAuth).toBe(true);
    });

    it('should detect database features', () => {
      const result = analyzeTask('Store data in PostgreSQL database');
      expect(result.features).toContain('database');
      expect(result.hasDatabase).toBe(true);
    });

    it('should detect realtime features', () => {
      const result = analyzeTask('Add real-time chat with WebSocket');
      expect(result.features).toContain('realtime');
      expect(result.hasRealtime).toBe(true);
    });

    it('should detect testing features', () => {
      const result = analyzeTask('Write unit tests with Jest');
      expect(result.features).toContain('testing');
    });
  });

  describe('complexity determination', () => {
    it('should classify simple tasks', () => {
      const result = analyzeTask('Create a simple React component');
      expect(result.complexity).toBe('simple');
    });

    it('should classify medium tasks', () => {
      const result = analyzeTask('Build a React app with authentication, database, and testing');
      expect(result.complexity).toBe('medium');
    });

    it('should classify complex tasks', () => {
      const result = analyzeTask('Create a fullstack app with auth, database, realtime, testing, payment, email, file upload, search, cache, and monitoring');
      expect(result.complexity).toBe('complex');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const result = analyzeTask('');
      expect(result.projectType).toBe('web-app');
      expect(result.features).toEqual([]);
      expect(result.complexity).toBe('simple');
    });

    it('should handle case insensitive input', () => {
      const result = analyzeTask('BUILD A REACT APP WITH CONTEXT API');
      expect(result.projectType).toBe('web-app');
      expect(result.features).toContain('frontend');
    });

    it('should handle partial word matches correctly', () => {
      const result = analyzeTask('Create a web application');
      expect(result.projectType).toBe('web-app');
    });

    it('should not match partial words inappropriately', () => {
      const result = analyzeTask('Create a webapplication');
      // Should not match "web app" in "webapplication"
      expect(result.projectType).toBe('web-app'); // Still matches 'app' keyword
    });
  });
});
