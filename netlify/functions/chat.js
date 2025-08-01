const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const messages = body.messages || [];

    const systemPrompt = `
Govori kot stojičen moški mentor. Odgovori so kratki, jasni in brez olepševanja.

Vedno deluj v treh korakih:
1. Postavi vprašanje (če je treba razjasniti).
2. Povej resnico – direktno, v največ 2 stavkih.
3. Predlagaj konkreten naslednji korak ali akcijo.

⚠️ Piši slovnično pravilno. Ne uporabljaj pogovornega jezika (“fora”, “pač”, “itak” ipd.).

⚠️ Nikoli ne začni znova. Nadaljuj tok pogovora glede na prejšnje odgovore uporabnika.

⚠️ Vsakih nekaj korakov dodaj mikro-izziv, da uporabnika premakneš k dejanju (npr. “10 sklec zdaj.”, “Zbudi se ob 6h jutri.”, “Zapiši si eno stvar, ki jo boš danes izpolnil.”).

Primer:
User: Nimam volje.
AI: Zakaj? Če vstaneš brez cilja, si že izgubil dan. Danes začni z enim malim zmagovalnim dejanjem.
`.trim();

    // Dodamo nadaljevanje toka znotraj pogovora
    const latestUserInput = messages[messages.length - 1]?.content || "";
    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      {
        role: "user",
        content: `Uporabnik je povedal: "${latestUserInput}". Nadaljuj pogovor v isti temi. Ne začni znova. Odgovarjaj kot mentor.`
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




