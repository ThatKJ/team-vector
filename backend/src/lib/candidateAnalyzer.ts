import { Candidate, CandidateTheory, ModuleAssessment, DimensionState } from './types';
import curriculumData from './data/curriculum.json';

// Mapping known missions to Curriculum Modules
const MISSION_MODULE_MAP: Record<string, number> = {
  'm1': 1, // Basic Python Setup -> Environment & Tooling
  'm2': 3, // Vector DB Setup -> Embeddings & Vector Search
  'm3': 5, // RAG Implementation -> Chatbot Application Build
  'm4': 6, // Agentic Tool Use -> Agentic AI & MCP
};

function createDefaultDimension(): DimensionState {
  return { score: 50, confidence: 0.1, trend: 'unknown' };
}

function createDefaultModule(moduleId: number): ModuleAssessment {
  return {
    moduleId,
    score: 50,
    confidence: 0.1,
    missionData: {
      attempted: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      averageAttempts: 0
    },
    interviewEvidence: []
  };
}

export function generateInitialTheory(sessionId: string, candidate: Candidate): CandidateTheory {
  const modules: Record<number, ModuleAssessment> = {};
  
  // Initialize all 8 modules with defaults
  for (const mod of curriculumData) {
    modules[mod.id] = createDefaultModule(mod.id);
  }

  // Parse candidate missions and update initial theory
  candidate.missions.forEach(mission => {
    const moduleId = MISSION_MODULE_MAP[mission.id];
    if (moduleId && modules[moduleId]) {
      const mod = modules[moduleId];
      mod.missionData.attempted = mission.status !== 'skipped' ? 1 : 0;
      mod.missionData.passed = mission.status === 'passed' ? 1 : 0;
      mod.missionData.failed = mission.status === 'failed' ? 1 : 0;
      mod.missionData.skipped = mission.status === 'skipped' ? 1 : 0;
      mod.missionData.averageAttempts = mission.attempts;

      // Deterministic initial scoring based on mission status
      if (mission.status === 'passed') {
        // More attempts means they struggled but persisted
        mod.score = mission.attempts === 1 ? 85 : Math.max(65, 85 - (mission.attempts * 5));
        mod.confidence = 0.5;
      } else if (mission.status === 'failed') {
        mod.score = 30;
        mod.confidence = 0.5;
      } else if (mission.status === 'skipped') {
        mod.score = 40; // Skipped implies potential gap
        mod.confidence = 0.2;
      }
    }
  });

  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateRole: candidate.role,
    sessionId,
    currentRound: 1,
    questionsAsked: 0,
    theoryVersion: 1.0,
    modules,
    dimensions: {
      reasoning: createDefaultDimension(),
      communication: createDefaultDimension(),
      architectureThinking: createDefaultDimension(),
      productionReadiness: createDefaultDimension(),
      tradeoffAwareness: createDefaultDimension()
    },
    evidence: [],
    claims: [],
    strategyHistory: []
  };
}
