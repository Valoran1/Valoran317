const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function (event, context) {
  try {
    const { messages } = JSON.parse(event.body);

    const systemMessage = {
      role: "system",
      content: `Deluješ kot moški AI mentor (stojičen, direkten, strukturiran). Vodiš pogovor v nitih, vedno se sklicuješ na prejšnji kontekst in ne začneš znova.

Vsak pogovor vodiš v 3 fazah:
1. Razjasni težavo (postavi podvprašanje, če je treba)
2. Poglobi razumevanje (poveži odgovore z novimi vprašanji)
3. Predlagaj konkreten naslednji korak

⚠️ Pomembno:
- Če uporabnik odgovori na tvoje vprašanje, to razumi kot NADALJEVANJE istega problema, ne nov začetek.
- Ostanek pogovora naj ima jasen fokus.
- Odgovarjaj kratko, moško, brez olepševanja.

Primer:
User: Ne znam se spraviti k vadbi.
AI: Zakaj misliš, da odlašaš? Čas, volja ali zmedenost?
User: Nimam energije.
AI: Potem za začetek... (nadaljuje logično)

Ne odgovarjaj kot da je vsaka izjava ločeno vprašanje. Nadaljuj strukturo.`
    };

    const fullMessages = [systemMessage, ...messages.filter(m => m.role !== "system")];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: fullMessages,
    });

    const encoder = new TextEncoder();
    const chunks = [];

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      chunks.push(text);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*"
      },
      body: chunks.join("")
    };

  } catch (error) {
    console.error("Napaka v funkciji:", error);
    return {
      statusCode: 500,
      body: "Napaka: " + error.message,
    };
  }
};




