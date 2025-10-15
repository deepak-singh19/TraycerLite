import { describe, it, expect } from 'vitest';
import { planTask } from '../src/planner.js';

describe('Planner', () => {
  describe('planTask', () => {
    it('should generate a plan for a web app with authentication', () => {
      const task = 'Build a task management app with user authentication and real-time updates';
      const plan = planTask(task);

      expect(plan).toBeDefined();
      expect(plan.task).toBe(task);
      expect(plan.generationMethod).toBe('rule-based');
      expect(plan.phases.length).toBeGreaterThan(0);
      expect(plan.techStack).toContain('TypeScript');
      expect(plan.techStack).toContain('React');
      expect(plan.techStack).toContain('JWT');

      // Should have setup phase
      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase).toBeDefined();
      expect(setupPhase?.name).toBe('Project Setup & Architecture');

      // Should have database phase (due to auth)
      const dbPhase = plan.phases.find(p => p.id === 'phase-database');
      expect(dbPhase).toBeDefined();

      // Should have auth phase
      const authPhase = plan.phases.find(p => p.id === 'phase-auth');
      expect(authPhase).toBeDefined();

      // Should have backend phase
      const backendPhase = plan.phases.find(p => p.id === 'phase-backend');
      expect(backendPhase).toBeDefined();

      // Should have frontend phase
      const frontendPhase = plan.phases.find(p => p.id === 'phase-frontend');
      expect(frontendPhase).toBeDefined();

      // Should have testing phase
      const testingPhase = plan.phases.find(p => p.id === 'phase-testing');
      expect(testingPhase).toBeDefined();
    });

    it('should generate a plan for a REST API', () => {
      const task = 'Create a REST API for a blog with comments and likes';
      const plan = planTask(task);

      expect(plan).toBeDefined();
      expect(plan.task).toBe(task);
      expect(plan.techStack).toContain('Express.js');
      expect(plan.techStack).toContain('PostgreSQL');

      // Should have setup phase
      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase).toBeDefined();

      // Should have database phase
      const dbPhase = plan.phases.find(p => p.id === 'phase-database');
      expect(dbPhase).toBeDefined();

      // Should have backend phase
      const backendPhase = plan.phases.find(p => p.id === 'phase-backend');
      expect(backendPhase).toBeDefined();

      // Should NOT have frontend phase for API-only project
      const frontendPhase = plan.phases.find(p => p.id === 'phase-frontend');
      expect(frontendPhase).toBeUndefined();
    });

    it('should generate a plan for a CLI tool', () => {
      const task = 'CLI tool for analyzing Git repositories and generating commit reports';
      const plan = planTask(task);

      expect(plan).toBeDefined();
      expect(plan.task).toBe(task);
      expect(plan.techStack).toContain('TypeScript');
      expect(plan.techStack).toContain('Node.js');

      // Should have setup phase
      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase).toBeDefined();

      // Should NOT have database, auth, frontend phases for CLI
      const dbPhase = plan.phases.find(p => p.id === 'phase-database');
      expect(dbPhase).toBeUndefined();

      const authPhase = plan.phases.find(p => p.id === 'phase-auth');
      expect(authPhase).toBeUndefined();

      const frontendPhase = plan.phases.find(p => p.id === 'phase-frontend');
      expect(frontendPhase).toBeUndefined();
    });

    it('should generate a plan for an e-commerce platform', () => {
      const task = 'E-commerce platform with Stripe payment integration and inventory management';
      const plan = planTask(task);

      expect(plan).toBeDefined();
      expect(plan.task).toBe(task);
      expect(plan.techStack).toContain('React');
      expect(plan.techStack).toContain('PostgreSQL');

      // Should have all major phases for e-commerce
      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase).toBeDefined();

      const dbPhase = plan.phases.find(p => p.id === 'phase-database');
      expect(dbPhase).toBeDefined();

      const backendPhase = plan.phases.find(p => p.id === 'phase-backend');
      expect(backendPhase).toBeDefined();

      const frontendPhase = plan.phases.find(p => p.id === 'phase-frontend');
      expect(frontendPhase).toBeDefined();

      // Should have payment-related risks
      expect(plan.risks.some(risk => risk.includes('payment'))).toBe(true);
    });

    it('should generate a plan for a real-time chat application', () => {
      const task = 'Real-time chat application with rooms, direct messages, and file sharing';
      const plan = planTask(task);

      expect(plan).toBeDefined();
      expect(plan.task).toBe(task);
      expect(plan.techStack).toContain('Socket.io');

      // Should have all phases for real-time app
      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase).toBeDefined();

      const dbPhase = plan.phases.find(p => p.id === 'phase-database');
      expect(dbPhase).toBeDefined();

      const backendPhase = plan.phases.find(p => p.id === 'phase-backend');
      expect(backendPhase).toBeDefined();

      const frontendPhase = plan.phases.find(p => p.id === 'phase-frontend');
      expect(frontendPhase).toBeDefined();

      // Should have realtime-related risks
      expect(plan.risks.some(risk => risk.includes('real-time'))).toBe(true);
    });

    it('should handle minimal task descriptions', () => {
      const task = 'Build a simple app';
      const plan = planTask(task);

      expect(plan).toBeDefined();
      expect(plan.task).toBe(task);
      expect(plan.phases.length).toBeGreaterThan(0);

      // Should at least have setup and testing phases
      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase).toBeDefined();

      const testingPhase = plan.phases.find(p => p.id === 'phase-testing');
      expect(testingPhase).toBeDefined();
    });

    it('should generate phases with proper dependencies', () => {
      const task = 'Build a task management app with user authentication';
      const plan = planTask(task);

      // Setup phase should have no dependencies
      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase?.dependencies).toEqual([]);

      // Database phase should depend on setup
      const dbPhase = plan.phases.find(p => p.id === 'phase-database');
      expect(dbPhase?.dependencies).toContain('phase-setup');

      // Auth phase should depend on setup and database
      const authPhase = plan.phases.find(p => p.id === 'phase-auth');
      expect(authPhase?.dependencies).toContain('phase-setup');
      expect(authPhase?.dependencies).toContain('phase-database');
    });

    it('should generate phases with file details', () => {
      const task = 'Build a simple web app';
      const plan = planTask(task);

      const setupPhase = plan.phases.find(p => p.id === 'phase-setup');
      expect(setupPhase?.files.length).toBeGreaterThan(0);

      setupPhase?.files.forEach(file => {
        expect(file.path).toBeDefined();
        expect(file.action).toMatch(/^(create|modify|delete)$/);
        expect(file.description).toBeDefined();
        expect(file.details.length).toBeGreaterThan(0);
      });
    });

    it('should include estimated times for phases', () => {
      const task = 'Build a web app with authentication';
      const plan = planTask(task);

      plan.phases.forEach(phase => {
        expect(phase.estimatedTime).toBeDefined();
        expect(phase.estimatedTime).toMatch(/^\d+\s+minutes$/);
      });
    });

    it('should generate appropriate tech stack based on features', () => {
      const task = 'Build a full-stack app with database, auth, and real-time features';
      const plan = planTask(task);

      expect(plan.techStack).toContain('TypeScript');
      expect(plan.techStack).toContain('Node.js');
      expect(plan.techStack).toContain('React');
      expect(plan.techStack).toContain('Express.js');
      expect(plan.techStack).toContain('PostgreSQL');
      expect(plan.techStack).toContain('JWT');
      expect(plan.techStack).toContain('Socket.io');
      expect(plan.techStack).toContain('Jest');
    });
  });
});
