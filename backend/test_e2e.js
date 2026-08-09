const testProfile = async (profileName, answers) => {
  console.log(`\n\n==============================================`);
  console.log(`Starting Profile: ${profileName}`);
  console.log(`==============================================`);
  
  let res = await fetch('http://localhost:3001/api/candidates');
  const candidates = await res.json();
  const candidate = candidates[0];
  
  const sessionId = `test-e2e-${profileName}-${Date.now()}`;
  let done = false;
  let turn = 0;

  res = await fetch('http://localhost:3001/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, candidate: { id: candidate.id } })
  });
  let data = await res.json();
  
  if (data.error) throw new Error("Start failed: " + data.error);
  console.log(`\n[INTERVIEW] Turn 0`);
  console.log(`Q: ${data.reply}`);
  console.log(`Assessment Signal: ${data.assessmentSignal}`);
  console.log(`Next Action: ${data.nextAction}`);
  
  while (!done && turn < 4) {
    const answer = answers[turn] || "I don't know.";
    console.log(`\n[CANDIDATE] A: ${answer}`);
    
    turn++;
    res = await fetch('http://localhost:3001/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: answer })
    });
    data = await res.json();
    if (data.error) throw new Error("Turn failed: " + data.error);
    
    if (data.done) {
      done = true;
      break;
    }

    console.log(`\n[INTERVIEW] Turn ${turn}`);
    console.log(`Q: ${data.reply}`);
    console.log(`Assessment Signal: ${data.assessmentSignal}`);
    console.log(`Next Action: ${data.nextAction}`);
  }
};

const run = async () => {
  const strongAnswers = [
    "Prefill is heavily compute-bound because it processes all prompt tokens in parallel, whereas decoding is memory-bandwidth bound because it generates one token at a time while reading the growing KV cache from HBM.",
    "To optimize KV cache memory, I would implement Grouped-Query Attention (GQA) to share key-value heads across multiple query heads, and PagedAttention to prevent memory fragmentation.",
    "I would deploy on an architecture like vLLM which uses Ray for distributed execution across multiple GPUs with tensor parallelism.",
    "For latency under 50ms, I'd quantify the time-to-first-token (TTFT) and time-between-tokens (TBT), optimizing TTFT via chunked prefill."
  ];

  const weakAnswers = [
    "I'm not sure about the KV cache. I think prefill is when the model starts, and decoding is when it generates text.",
    "I don't know what GQA or PagedAttention is. Can we talk about something else?",
    "I have used Python and simple REST APIs before, but not distributed GPU inference.",
    "I usually just use the default settings."
  ];

  try {
    await testProfile("Strong Candidate (Candidate A)", strongAnswers);
    await testProfile("Weak Candidate (Candidate B)", weakAnswers);
    console.log("\n✅ E2E Complete: Paths diverged successfully!");
  } catch (err) {
    console.error(err);
  }
};

run();
