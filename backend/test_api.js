const test = async () => {
  console.log("1. Fetching candidates from backend...");
  let res = await fetch('http://localhost:3001/api/candidates');
  const candidates = await res.json();
  const candidate = candidates[0];
  console.log("Candidate fetched:", candidate.name);

  const sessionId = "test-" + Date.now();

  console.log("\n2. Starting interview...");
  res = await fetch('http://localhost:3001/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, candidate })
  });
  let data = await res.json();
  console.log("Start Response:", data);

  if (data.error) throw new Error("Start failed: " + data.error);

  console.log("\n3. Submitting first answer...");
  res = await fetch('http://localhost:3001/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message: "I know Python very well." })
  });
  data = await res.json();
  console.log("Turn 1 Response:", data);

  console.log("\n4. Submitting second answer...");
  res = await fetch('http://localhost:3001/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message: "A list comprehension is an elegant way to define and create lists based on existing lists." })
  });
  data = await res.json();
  console.log("Turn 2 Response:", data);
  
  console.log("\nTest complete!");
};

test().catch(console.error);
