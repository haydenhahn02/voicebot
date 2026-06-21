const consoleEl = document.querySelector(".console");
const orb = document.getElementById("orb");
const stateLabel = document.getElementById("state-label");
const transcriptEl = document.getElementById("transcript");
const form = document.getElementById("input-form");
const textInput = document.getElementById("text-input");
const micToggle = document.getElementById("mic-toggle");
const statusLine = document.getElementById("status-line");

const history = []; // { role: "user" | "assistant", content: string }
let isListening = false;
let hasGreeted = false;

// ---------- State machine ----------

function setState(state) {
  consoleEl.dataset.state = state;
  stateLabel.textContent = state;
}

setState("idle");

// ---------- Transcript UI ----------

function addBubble(role, text) {
  const hint = transcriptEl.querySelector(".transcript__hint");
  if (hint) hint.remove();

  const bubble = document.createElement("p");
  bubble.className = role === "user" ? "bubble bubble--user" : "bubble bubble--claude";
  bubble.textContent = text;
  transcriptEl.appendChild(bubble);
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function setStatus(text) {
  statusLine.textContent = text || "\u00A0";
}

// ---------- Speech synthesis (Claude speaking) ----------

function speak(text) {
  if (!("speechSynthesis" in window)) {
    setState("idle");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.onstart = () => setState("speaking");
  utterance.onend = () => setState("idle");
  utterance.onerror = () => setState("idle");
  window.speechSynthesis.speak(utterance);
}

// ---------- Talking to Claude ----------

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  addBubble("user", trimmed);
  history.push({ role: "user", content: trimmed });
  setState("thinking");
  setStatus("Claude is thinking…");
  textInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await response.json();

    if (data.error) {
      setStatus(data.error);
      addBubble("assistant", `(error) ${data.error}`);
      setState("idle");
      return;
    }

    history.push({ role: "assistant", content: data.reply });
    addBubble("assistant", data.reply);
    setStatus("");
    speak(data.reply);
  } catch (err) {
    console.error(err);
    setStatus("Couldn't reach the server. Is it running?");
    setState("idle");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(textInput.value);
});

// ---------- Speech recognition (you talking) ----------

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;

if (SpeechRecognition) {
  recognizer = new SpeechRecognition();
  recognizer.lang = "en-US";
  recognizer.continuous = false;
  recognizer.interimResults = false;

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sendMessage(transcript);
  };

  recognizer.onerror = (event) => {
    setStatus(`Mic error: ${event.error}`);
    stopListening();
  };

  recognizer.onend = () => {
    if (isListening) stopListening();
  };
} else {
  setStatus("Voice input isn't supported in this browser — try Chrome. You can still type.");
  micToggle.disabled = true;
}

function startListening() {
  if (!recognizer) return;
  window.speechSynthesis.cancel();
  isListening = true;
  micToggle.classList.add("is-active");
  setState("listening");
  setStatus("Listening…");
  try {
    recognizer.start();
  } catch {
    // already started; ignore
  }
}

function stopListening() {
  isListening = false;
  micToggle.classList.remove("is-active");
  if (consoleEl.dataset.state === "listening") setState("idle");
  setStatus("");
  try {
    recognizer && recognizer.stop();
  } catch {
    // ignore
  }
}

function toggleListening() {
  if (!recognizer) return;
  isListening ? stopListening() : startListening();
}

micToggle.addEventListener("click", toggleListening);
orb.addEventListener("click", toggleListening);
