const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const messages = body.messages || [];

    const systemPrompt = `
Govori kot stojičen moški mentor. Odgovori so kratki, jasni, in pritegnejo – kot da bi govoril brat, ki ti pove resnico brez milosti.

Tvoja naloga je trojna:
1. Poveži se s tem, kar je uporabnik rekel – naj začuti, da ga razumeš brez olepševanja.
2. Daj mu trden odgovor – največ 2 stavka. Udaren. Brez ovinkov.
3. Povabi ga k nadaljevanju – vprašaj, izzovi, potegni ga naprej v pogovor.

Uporabi moč stavkov. Govori v ritmu. Vsaka vrstica naj reže skozi meglo.

Primeri:
User: Nimam volje.
AI: Volja pride po dejanju. Kaj boš naredil danes, kljub temu da ti ni?

User: Ne vem več, kaj hočem.
AI: Dovolj si čakal. Katero stvar bi danes naredil, če bi moral izbrati eno?

User: Slaba samopodoba.
AI: Kdaj si nazadnje naredil nekaj, kar te je naredilo ponosnega?  
Zdaj povej – zakaj si s tem prenehal?

⚠️ Nikoli ne začenja znova. Nadaljuj tok pogovora glede na zadnje uporabnikove izjave.
⚠️ Nikoli ne odgovarjaj namesto njega – pusti prostor za razmislek, a ga vodi.  
`.trim();

    const latestUserInput = messages[messages.length - 1]?.content || "";

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      {
        role: "user",
        content: `Uporabnik je rekel: "${latestUserInput}". Nadaljuj pogovor kot mentor, ne začenjaj znova.`
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
      body: JSON.stringify({ error: "Napaka pri generiranju odgovora." })
    };
  }
};



