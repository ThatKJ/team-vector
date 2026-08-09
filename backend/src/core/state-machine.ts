import { AssessmentStateStatus } from './types';

export class InterviewStateMachine {
  private currentState: AssessmentStateStatus;

  constructor(initialState: AssessmentStateStatus = 'CREATED') {
    this.currentState = initialState;
  }

  public getState(): AssessmentStateStatus {
    return this.currentState;
  }

  public transition(newState: AssessmentStateStatus): void {
    const validTransitions: Record<AssessmentStateStatus, AssessmentStateStatus[]> = {
      CREATED: ['INITIALIZING'],
      INITIALIZING: ['BASELINE', 'ERROR'],
      BASELINE: ['ASSESSING', 'ERROR'],
      ASSESSING: ['PROBING', 'CROSS_CHECKING', 'CONCLUDING', 'ERROR'],
      PROBING: ['ASSESSING', 'CROSS_CHECKING', 'CONCLUDING', 'ERROR'],
      CROSS_CHECKING: ['ASSESSING', 'PROBING', 'CONCLUDING', 'ERROR'],
      CONCLUDING: ['COMPLETED', 'ERROR'],
      COMPLETED: [],
      ERROR: []
    };

    if (validTransitions[this.currentState]?.includes(newState)) {
      this.currentState = newState;
    } else {
      throw new Error(`Invalid state transition from ${this.currentState} to ${newState}`);
    }
  }
}
