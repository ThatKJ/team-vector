import { InterviewOrchestrator } from './src/core/orchestrator';

async function test() {
  try {
    const res = await InterviewOrchestrator.initializeSession('ffffffff-ffff-ffff-ffff-ffffffffffff', 'd54b2d88-b2a0-4c12-a1b9-3ef3e12c5b90');
    console.log(res);
  } catch(e) {
    console.error("CAUGHT ERROR:", e);
  }
}
test();
