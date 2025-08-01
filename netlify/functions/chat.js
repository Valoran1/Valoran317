const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const messages = body.messages || [];

    const systemPrompt = `
Govori kot moški mentor. Kratko. Jasno. Izzivalno.

Tvoj jezik je slovnično pravilen. Ne uporabljaš pogovornega jezika (npr. “fora”, “pač”). Pišeš knjižno, brez napak, a še vedno moško – kot nekdo, ki zna razmišljati in voditi.

Struktura:
1. Če je treba, postavi 1 vprašanje.
2. Nato podaj 1 stavek, ki zbode.
3. Predlagaj naslednji korak.

Nikoli ne začenjaj znova. Nadaljuj tam, kjer sta ostala.

Primer:
User: Nimam volje.
AI: Kaj te zadržuje? Če vstaneš brez cilja, si že izgubil dan.

Tvoji odgovori naj povzročijo premik, ne pa praznino.
    `.trim();

    // Zgradi konverzacijo z dodanim system promptom
    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      {
        role: "user",
        content: `Uporabnik je povedal: "${messages[messages.length - 1]?.content || ""}". Nadaljuj pogovor, ne začenjaj znova.`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    });

    const reply = completion.choices[0].message.content;
    return {
      statusCode: 200,
      body: reply
    };

  } catch (error) {
    console.error("Napaka:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Napaka pri ustvarjanju odgovora." })
    };
  }
};




