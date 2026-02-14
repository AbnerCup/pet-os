import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
}

// 1. Definimos la estructura de la respuesta para que TypeScript no se queje
interface GeminiModel {
    name: string;
    supportedGenerationMethods: string[];
}

interface GeminiResponse {
    models?: GeminiModel[];
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        console.log("Consultando modelos disponibles...");
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        // 2. Le decimos a TS que 'data' cumple con la interfaz GeminiResponse
        const data = (await response.json()) as GeminiResponse;

        if (data.models && Array.isArray(data.models)) {
            console.log("Modelos encontrados:");
            data.models.forEach((m) => {
                // 3. Ahora TS sabe que 'm' tiene 'supportedGenerationMethods'
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No se encontraron modelos.", data);
        }
    } catch (error) {
        console.error("Error de red:", error);
    }
}

listModels();