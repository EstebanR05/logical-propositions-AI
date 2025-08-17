import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function verificarInferencia(premisas: any[], conclusion: any, reglas: any[]) {
  const prompt = handlePrompt(premisas, conclusion, reglas);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", // puedes usar gpt-4.1, gpt-4o, etc.
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  try {
    const content = response.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    } else {
      return { pasos: [content ?? "Sin contenido"], resultado: "Error: contenido indefinido o nulo" };
    }
  } catch (e) {
    // fallback si no devuelve JSON válido
    const content = response.choices?.[0]?.message?.content;
    return { pasos: [content ?? "Sin contenido"], resultado: "Error al parsear" };
  }
}

const handlePrompt = (premisas: any[], conclusion: any, reglas: any[]) => {
  const text = `
Eres un experto en lógica proposicional.
Tienes las siguientes premisas:
${premisas.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Conclusión a verificar: ${conclusion}

Reglas de inferencia permitidas: ${reglas.join(", ")}

Instrucciones:
1. Verifica si la conclusión se sigue lógicamente de las premisas usando SOLO esas reglas.
2. Explica paso a paso qué regla aplicas en cada paso.
3. Indica al final si la conclusión es válida o no.
4. Devuelve la respuesta en JSON con dos claves: "pasos" (array de strings) y "resultado" (string).
`;

  return text;
}
