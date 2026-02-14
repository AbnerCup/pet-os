
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
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
        const data = await response.json();
        if (data.models) {
            console.log("Modelos encontrados:");
            data.models.forEach((m: any) => {
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
