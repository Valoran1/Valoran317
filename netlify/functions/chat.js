const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const messages = body.messages || [];
    const goal = body.goal || "";
    const tone = body.tone || "";
    const messageCount = body.messageCount || 0;

    let contextInstructions = "";

    if (goal) {
      contextInstructions += `Uporabnikov trenutni cilj je: "${goal}".\n`;
    }

    if (tone === "frustrated") {
      contextInstructions += `Uporabnik zveni frustriran in izgubljen. Odgovori ostro, a ciljno.\n`;
    } else if (tone === "soft") {
      contextInstructions += `Uporabnik zveni neodločno in potrebuje usmeritev. Vodi ga brez ovinkarjenja.\n`;
    }

    if (messageCount > 0 && messageCount % 5 === 0) {
      contextInstructions += `Naredi kratek povzetek dosedanjega napredka in preveri ali sledi svojemu cilju.\n`;
    }

    const systemPrompt = `
Govori kot stojičen moški mentor. Tvoj jezik je kratek, natančen in močan. Ne olepšuj. Ne filozofiraj. Ne tolaži. Vodi.

⚠️ Uporabljaj največ 2 stavka, razen če daješ navodila.  
⚠️ Ne začni znova – nadaljuj točno tam, kjer sta ostala.  
⚠️ Stavki naj imajo moč, rez in namen. Brez praznin.

👉 Če uporabnik zveni pasivno, zmeden ali obupan – govori trdo. Zbudi ga.  
👉 Če uporabnik išče izgovore – izzovi ga.  
👉 Če išče smer – daj mu akcijo. Ne razlago.

Uporabljaj tudi:
- eno močno vprašanje in se ustavi (“Kaj sploh hočeš od sebe?”)  
- kratek udarec resnice (“Če še danes čakaš, si že zaostal.”)  
- neposredno navodilo (“Ugasni telefon. Zdaj. In napiši mi, kaj boš naredil.”)

${contextInstructions}
`.trim();

    const latestUserInput = messages[messages.length - 1]?.content || "";

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      {
        role: "user",
        content: `Uporabnik je povedal: "${latestUserInput}". Nadaljuj pogovor v isti smeri. Ne začni znova.`
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




