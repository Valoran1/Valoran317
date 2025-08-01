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
      body: JSON.stringify({ messages })
    });

    const reply = await response.text();
    addMessage("valoran", reply);

    messages.push({ role: "user", content: userMessage });
    messages.push({ role: "assistant", content: reply });

  } catch (error) {
    addMessage("valoran", "⚠️ Napaka pri povezavi s strežnikom.");
    console.error("Napaka:", error);
  }
});

function addMessage(role, content) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerText = content;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}



