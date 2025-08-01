const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatLog = document.getElementById("chat-log");
let chatHistory = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = input.value.trim();
  if (!userInput) return;

  addMessage("user", userInput);
  chatHistory.push({ role: "user", content: userInput });
  input.value = "";

  const typing = showTypingIndicator();

  const res = await fetch("/.netlify/functions/chat", {
    method: "POST",
    body: JSON.stringify({ messages: chatHistory }),
  });

  if (!res.ok) {
    typing.remove();
    addMessage("assistant", "Napaka pri pridobivanju odgovora.");
    return;
  }

  const responseText = await res.text();
  typing.remove();

  const msgElement = addMessage("assistant", "");
  simulateTyping(msgElement, responseText);
  chatHistory.push({ role: "assistant", content: responseText });
});

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerText = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
  return msg;
}

function showTypingIndicator() {
  const container = document.createElement("div");
  container.className = "message assistant";

  const typing = document.createElement("div");
  typing.className = "typing-indicator";
  typing.innerHTML = "<span></span><span></span><span></span>";

  container.appendChild(typing);
  chatLog.appendChild(container);
  chatLog.scrollTop = chatLog.scrollHeight;
  return container;
}

function simulateTyping(element, text) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      element.innerText += text[index];
      index++;
      chatLog.scrollTop = chatLog.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, 20);
}


