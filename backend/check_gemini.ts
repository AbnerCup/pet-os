
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("ERROR: No se encontró GEMINI_API_KEY en las variables de entorno.");
    process.exit(1);
}

console.log(`Usando API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testConnection() {
    try {
        console.log("Intentando conectar con Gemini...");
        const prompt = "Responde con 'OK' si recibes este mensaje.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Respuesta de Gemini:", text);
        console.log("¡Conexión exitosa!");
    } catch (error: any) {
        console.error("Error al conectar con Gemini:", error.message || error);
        if (error.status === 404) {
            console.log("Sugerencia: El modelo 'gemini-1.5-flash' podría no estar disponible para tu clave API. Intenta usar 'gemini-pro'.");
        }
    }
}

testConnection();
