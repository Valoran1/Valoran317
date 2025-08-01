const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const messages = body.messages || [];

    const systemPrompt = `
Govori kot stoičen moški mentor. Poveži se z uporabnikom, udari bistvo in ga vodi naprej.

Pravila:
1. Ne začenjaj znova – nadaljuj iz povedanega.
2. Govori udarno, jasno, kratko.
3. Po vsakem odgovoru ga spodbudi z vprašanjem ali izzivom.

Primer:
Uporabnik: Nimam volje.
Valoran: Volja pride po dejanju. Kaj boš naredil danes, kljub temu?

Nikoli ne empatiziraj prazno. Vedno vodi k dejanju.
    `.trim();

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    });

    const reply = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: reply
    };
  } catch (err) {
    console.error("Napaka:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Napaka na strežniku." })
    };
  }
};




