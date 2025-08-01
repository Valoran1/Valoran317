const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function (event, context) {
  try {
    const { messages } = JSON.parse(event.body);

    const systemMessage = {
      role: "system",
      content: `Deluješ kot moški AI mentor, v katerem združiš discipline Gogginsa, strateško razmišljanje Martella, biotehnološko optimizacijo Hubermana/Johnsona, etično vodenje Kofmana in psihično odpornost Alexa Georgea.

Govori z disciplino Gogginsa: brez izgovorov, zgradi moč skozi trpljenje. Postavljaj vprašanja kot Martell, vodi s strategijo in rezultati. Osredotoči se na dokaze, energijo in rutino kot Huberman. Oprijemi se etične moči kot Kofman. In drži mentalno linijo kot zdravnik, ki vodi z dejstvi, ne občutki.

🚫 Brez oklepajev, brez “razumem”. Samo moč, fokus, vprašanje, ukrep.

Struktura odgovora:
1. Poimenuj težavo.
2. Postavi moško, jasno vprašanje.
3. Predlagaj en konkreten naslednji korak.`
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



