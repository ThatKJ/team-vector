const fs = require('fs');

async function run() {
  console.log("Starting E2E Test...");
  
  // Wait for servers to be ready
  await new Promise(r => setTimeout(r, 2000));

  console.log("1. Fetching candidates...");
  let res = await fetch('http://localhost:3001/api/candidates');
  if (!res.ok) throw new Error("Failed to fetch candidates");
  let candidates = await res.json();
  const candidate = candidates[0];
  console.log(`Selected Candidate: ${candidate.name} (${candidate.id})`);

  console.log("2. Starting interview...");
  res = await fetch('http://localhost:3001/api/interviews/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_id: candidate.id })
  });
  if (!res.ok) throw new Error(`Failed to start interview: ${await res.text()}`);
  let startData = await res.json();
  const interviewId = startData.interview_id;
  console.log(`Interview Started: ${interviewId}`);
  console.log(`Question 1: ${startData.first_turn.question}`);

  let currentTurn = startData.first_turn;
  let isComplete = false;
  let turnsCount = 1;

  while (!isComplete && turnsCount <= 8) {
    console.log(`\n3. Submitting Answer for turn ${currentTurn.turn_id}...`);
    res = await fetch(`http://localhost:3001/api/interviews/${interviewId}/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turn_id: currentTurn.turn_id,
        answer: "I would use a distributed RAG pipeline with Pinecone and strict access controls."
      })
    });
    if (!res.ok) throw new Error(`Failed to submit turn: ${await res.text()}`);
    let turnData = await res.json();
    isComplete = turnData.is_complete;
    
    if (!isComplete) {
      currentTurn = turnData.next_turn;
      turnsCount++;
      console.log(`Follow-up Question ${turnsCount}: ${currentTurn.question}`);
    } else {
      console.log(`\nInterview Completed after ${turnsCount} turns!`);
    }
  }

  console.log("\n4. Fetching Report...");
  res = await fetch(`http://localhost:3001/api/interviews/${interviewId}/report`);
  if (!res.ok) throw new Error("Failed to fetch report");
  let report = await res.json();
  console.log(`Report Score: ${report.score}`);
  console.log("E2E Test Passed Successfully.");
}

run().catch(console.error);
