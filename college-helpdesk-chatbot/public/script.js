const conversation = document.getElementById("conversation");
const input = document.getElementById("questionInput");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearChat");
const suggestionBlock = document.getElementById("suggestionBlock");

function scrollToBottom() {
  conversation.scrollTop = conversation.scrollHeight;
}

function addMessage(text, sender, extra = {}) {
  const row = document.createElement("div");
  row.className = `message-row ${sender === "user" ? "user-row" : "bot-row"}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "You" : "✦";

  const content = document.createElement("div");
  content.className = "message-content";

  const label = document.createElement("div");
  label.className = "sender";
  label.textContent = sender === "user" ? "YOU" : "COLLEGE HELPDESK AI";

  const bubble = document.createElement("div");
  bubble.className = `bubble ${sender === "user" ? "user-bubble" : "bot-bubble"}`;
  bubble.textContent = text;

  content.append(label, bubble);
  if (sender === "bot" && extra.matchedQuestion) {
    const note = document.createElement("div");
    note.className = "match-note";
    note.textContent = `Matched FAQ: ${extra.matchedQuestion} · Similarity: ${(extra.confidence * 100).toFixed(1)}%`;
    content.appendChild(note);
  }
  row.append(avatar, content);
  conversation.appendChild(row);

  if (sender === "bot" && Array.isArray(extra.suggestions) && extra.suggestions.length) {
    const wrap = document.createElement("div");
    wrap.className = "suggestion-block";
    const heading = document.createElement("p");
    heading.textContent = "RELATED QUESTIONS";
    const chips = document.createElement("div");
    chips.className = "suggestion-chips";
    extra.suggestions.forEach(question => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "suggestion-chip";
      chip.textContent = question;
      chip.addEventListener("click", () => submitQuestion(question));
      chips.appendChild(chip);
    });
    wrap.append(heading, chips);
    conversation.appendChild(wrap);
  }
  scrollToBottom();
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "message-row bot-row";
  row.id = "typingIndicator";
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "✦";
  const content = document.createElement("div");
  content.className = "message-content";
  const label = document.createElement("div");
  label.className = "sender";
  label.textContent = "COLLEGE HELPDESK AI";
  const bubble = document.createElement("div");
  bubble.className = "bubble bot-bubble typing";
  bubble.innerHTML = "<span></span><span></span><span></span>";
  content.append(label, bubble);
  row.append(avatar, content);
  conversation.appendChild(row);
  scrollToBottom();
}

async function submitQuestion(value = input.value) {
  const question = value.trim();
  if (!question || sendButton.disabled) return;
  addMessage(question, "user");
  input.value = "";
  sendButton.disabled = true;
  suggestionBlock?.remove();
  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to get a response.");
    document.getElementById("typingIndicator")?.remove();
    addMessage(data.answer, "bot", data);
  } catch (error) {
    document.getElementById("typingIndicator")?.remove();
    addMessage(error.message || "I couldn't connect to the server. Please try again.", "bot");
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
}

sendButton.addEventListener("click", () => submitQuestion());
input.addEventListener("keydown", event => {
  if (event.key === "Enter") submitQuestion();
});

document.querySelectorAll(".suggestion-chip").forEach(chip => {
  chip.addEventListener("click", () => submitQuestion(chip.textContent));
});

clearButton.addEventListener("click", () => {
  conversation.innerHTML = `
    <div class="date-label">NEW CONVERSATION</div>
    <div class="message-row bot-row">
      <div class="message-avatar">✦</div>
      <div class="message-content">
        <div class="sender">COLLEGE HELPDESK AI</div>
        <div class="bubble bot-bubble">Welcome back! What would you like to know?</div>
      </div>
    </div>`;
  input.value = "";
  input.focus();
  scrollToBottom();
});

fetch("/api/health")
  .then(response => { if (!response.ok) throw new Error("Server health check failed"); })
  .catch(() => addMessage("The server connection could not be verified. Please make sure the Node.js server is running.", "bot"));