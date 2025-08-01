let messages = [];

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("user-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  input.value = "";

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] })
    });

    const reply = await response.text();
    addMessage("bot", reply);

    messages.push({ role: "user", content: userMessage });
    messages.push({ role: "assistant", content: reply });

  } catch (error) {
    addMessage("bot", "⚠️ Napaka pri povezavi.");
    console.error(error);
  }
});

function addMessage(role, content) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = role === "user" ? "user-message" : "bot-message";
  msg.textContent = content;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function scrollToBottom() {
  document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
}



