const http = require('http');
const crypto = require('crypto');
async function runTest() {
  const fetch = (await import('node-fetch')).default;
  
  // 1. Get Candidate
  const candRes = await fetch("http://localhost:3001/api/candidates");
  if (!candRes.ok) throw new Error("Failed to fetch candidates: " + await candRes.text());
  const candidates = await candRes.json();
  const candidate = candidates.find(c => c.name === "Alex Chen") || candidates[0];
  
  console.log("Selected Candidate:", candidate.name, "ID:", candidate.id);
  
  // 2. Start Interview
  console.log("=== STARTING INTERVIEW ===");
  const sessionId = crypto.randomUUID();
  console.log("Session ID:", sessionId);
  
  let res = await fetch("http://localhost:3001/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, candidate: { id: candidate.id } })
  });
  
  if (!res.ok) throw new Error("Start failed: " + await res.text());
  let data = await res.json();
  
  // 3. Loop until done (up to 8 turns)
  let turns = 0;
  while (!data.done && turns < 8) {
    turns++;
    console.log(`[Turn ${turns}] Q: ${data.reply}`);
    
    // wait 1 sec
    await new Promise(r => setTimeout(r, 1000));
    
    console.log(`=== SUBMITTING ANSWER for Turn ${turns} ===`);
    res = await fetch("http://localhost:3001/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: "I would use a robust scalable architecture with load balancing." })
    });
    
    if (!res.ok) throw new Error("Submit failed: " + await res.text());
    data = await res.json();
  }
  
  console.log("=== INTERVIEW COMPLETE ===");
  console.log(data);
  
  // 4. Fetch Report
  console.log("=== FETCHING REPORT ===");
  const repRes = await fetch(`http://localhost:3001/api/interviews/${sessionId}/report`);
  if (!repRes.ok) throw new Error("Report fetch failed: " + await repRes.text());
  const report = await repRes.json();
  console.log("Report:", JSON.stringify(report, null, 2));
  
  console.log("TEST PASSED!");
}

runTest().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
