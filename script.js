const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatContainer = document.getElementById("chat-log");

let chatHistory = [
  {
    role: "system",
    content: `Govori kot izkušen moški mentor: jasen, miren, neposreden. Vodilo: fokus, odgovornost, dejanja.

Struktura:
1. Opiši težavo v 1 stavku.
2. Postavi 1 konkretno podvprašanje.
3. Predlagaj 1 naslednji korak.

Ne olepšuj. Ne razlagaj preveč. Govori pogovorno, ne robotsko. Ne pametuj – vodi. Maks 3 stavki.`
  }
];

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add(sender === "user" ? "user-message" : "bot-message");
  message.textContent = text;
  chatContainer.appendChild(message);
  message.scrollIntoView({ behavior: "smooth" });
}

async function streamReply(reader) {
  const decoder = new TextDecoder();
  let fullText = "";

  const message = document.createElement("div");
  message.classList.add("bot-message");
  chatContainer.appendChild(message);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    fullText += chunk;
  }

  const words = fullText.split(" ");
  let index = 0;

  function typeNextWord() {
    if (index < words.length) {
      message.textContent += (index > 0 ? " " : "") + words[index];
      message.scrollIntoView({ behavior: "smooth" });
      index++;
      setTimeout(typeNextWord, 50); // Hitrost tipkanja
    } else {
      chatHistory.push({ role: "assistant", content: fullText });
    }
  }

  typeNextWord();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = input.value.trim();
  if (!userInput) return;

  addMessage(userInput, "user");
  chatHistory.push({ role: "user", content: userInput });
  input.value = "";

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });

    const reader = response.body.getReader();
    await streamReply(reader);
  } catch (error) {
    addMessage("Napaka: poskusi znova.", "bot");
    console.error(error);
  }
});

// Scroll gumb
const scrollBtn = document.createElement("button");
scrollBtn.id = "scroll-btn";
scrollBtn.title = "Pomakni se na dno";
scrollBtn.textContent = "↓";
document.body.appendChild(scrollBtn);

window.addEventListener("scroll", () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
  scrollBtn.style.display = nearBottom ? "none" : "block";
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

