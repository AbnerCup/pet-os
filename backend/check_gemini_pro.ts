
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Intentamos con gemini-pro que suele ser más estable para cuentas gratuitas
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function run() {
    try {
        const prompt = "Hola, responde con 'OK' si recibes este mensaje.";
        console.log("Conectando con modelo 'gemini-pro'...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Respuesta:", text);
    } catch (error: any) {
        console.error("Error connecting to gemini-pro:", error.message || error);
    }
}

run();
