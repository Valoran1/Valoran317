let messages = [];
let goal = "";
let messageCount = 0;

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("user-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  input.value = "";
  messageCount++;

  // Zaznaj cilj
  if (!goal && /(hočem|rad bi|cilj|želim|moram|morali bi)/i.test(userMessage)) {
    goal = userMessage;
  }

  // Zaznaj ton
  let tone = "";
  if (/(nič ne gre|nimam volje|ne zmorem|sovražim|jebem|obupano|preklinjam)/i.test(userMessage)) {
    tone = "frustrated";
  } else if (/(ne vem|mogoče|ni mi jasno|nisem prepričan)/i.test(userMessage)) {
    tone = "soft";
  }

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, goal, tone, messageCount })
    });

    const reply = await response.text();

    addMessage("valoran", reply);

    messages.push({ role: "user", content: userMessage });
    messages.push({ role: "assistant", content: reply });

  } catch (error) {
    addMessage("valoran", "⚠️ Napaka pri povezavi s strežnikom.");
    console.error("Napaka pri pošiljanju:", error);
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


