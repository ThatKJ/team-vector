const test = async () => {
  console.log("1. Fetching candidates from backend...");
  let res = await fetch('http://localhost:3001/api/candidates');
  const candidates = await res.json();
  const candidate = candidates[0];
  console.log("Candidate fetched:", candidate.name);

  const sessionId = "test-e2e-" + Date.now();
  let done = false;
  let turn = 0;

  console.log("\n2. Starting interview...");
  res = await fetch('http://localhost:3001/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, candidate: { id: candidate.id } })
  });
  let data = await res.json();
  
  if (data.error) throw new Error("Start failed: " + data.error);
  console.log(`[INTERVIEW] Turn 0 | Q: ${data.reply}`);
  if (data.reply.includes("(MOCK)")) throw new Error("FAIL: (MOCK) detected!");
  
  while (!done && turn < 15) {
    turn++;
    console.log(`\n3. Submitting answer for Turn ${turn}...`);
    res = await fetch('http://localhost:3001/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: "I understand the tradeoffs. Vector databases are powerful." })
    });
    data = await res.json();
    if (data.error) throw new Error("Turn failed: " + data.error);
    
    console.log(`[INTERVIEW] Turn ${turn} | Q: ${data.reply}`);
    if (data.reply.includes("(MOCK)")) throw new Error("FAIL: (MOCK) detected!");
    
    done = data.done;
  }

  console.log("\n4. Verifying Report payload...");
  if (!data.feedback) throw new Error("Missing feedback in done payload");
  console.log(data.feedback);

  console.log("\n✅ E2E Complete: ZERO (MOCK) text appeared, properly completed!");
};

test().catch(console.error);
